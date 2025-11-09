'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type UnitKind = 'PIECE' | 'BUNDLE'

type Category = { id: string; name: string }
type UploadResponse = { url: string }

const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE as string | undefined) || '/api/v1'

// В демо-сборке sellerId фиксированный, если у вас есть профиль — подставьте из него
const DEFAULT_SELLER_ID = 's-ec'

// Утилиты
function asArray<T = any>(x: any): T[] {
  if (Array.isArray(x)) return x
  if (x && Array.isArray(x.items)) return x.items
  if (x && Array.isArray(x.data)) return x.data
  return []
}

// Генерация SKU на бэке необязательна, но если модель требует — отправим автогенерированный
function generateSku(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[ё]/g, 'e')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `${base || 'product'}-${rand}`.toUpperCase()
}

// Хук для числовых строк: только цифры, убираем '0' на фокусе
function useNumberString(initial = '') {
  const [val, setVal] = useState<string>(initial)

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value.replace(/[^\d]/g, '')
    setVal(next)
  }

  function onFocus(e: React.FocusEvent<HTMLInputElement>) {
    if (e.currentTarget.value === '0') setVal('')
  }

  return {
    value: val,
    set: setVal,
    bind: {
      value: val,
      onChange,
      onFocus,
      inputMode: 'numeric' as const,
      autoComplete: 'off',
      pattern: '\\d*',
    },
    asInt: (fallback = 0) => {
      const n = parseInt(val, 10)
      return Number.isFinite(n) ? n : fallback
    },
  }
}

export default function NewProductPage() {
  const router = useRouter()

  // Категории
  const [categories, setCategories] = useState<Category[]>([])
  const [catLoading, setCatLoading] = useState(true)
  const [catError, setCatError] = useState<string | null>(null)

  // Основные поля
  const [sellerId, setSellerId] = useState(DEFAULT_SELLER_ID)
  const [categoryId, setCategoryId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('')
  const [country, setCountry] = useState('')
  const cutLength = useNumberString('') // ростовка (см), по ТЗ без ведущего 0

  // Упаковка/цены
  const [unitKind, setUnitKind] = useState<UnitKind>('PIECE') // упаковка: штучно или пачками
  const pricePerUnit = useNumberString('') // цена за 1 шт
  const pricePerBundle = useNumberString('') // цена за 1 пачку
  const piecesPerBox = useNumberString('') // шт. в коробке
  const bundlesPerBox = useNumberString('') // пачек в коробке

  // Фото (список ссылок, загружаем через /api/upload)
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Ошибки/процесс
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  // Подтягиваем sellerId из локального профиля, если есть
  useEffect(() => {
    try {
      const raw = localStorage.getItem('seller_profile')
      if (raw) {
        const p = JSON.parse(raw)
        if (p?.id) setSellerId(String(p.id))
      }
    } catch {}
  }, [])

  // Грузим категории
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setCatLoading(true)
      setCatError(null)
      try {
        const res = await fetch(`${API_BASE}/categories`, { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        const list = asArray<Category>(data)
        if (!cancelled) {
          setCategories(list)
          if (!categoryId && list.length) setCategoryId(list[0].id)
        }
      } catch (e: any) {
        if (!cancelled) {
          setCatError('Не удалось загрузить категории')
          setCategories([])
        }
      } finally {
        if (!cancelled) setCatLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Расчёт цены за коробку и stemsPerBox (число «штук» в коробке для модели)
  const calc = useMemo(() => {
    const units = piecesPerBox.asInt(0)
    const bundles = bundlesPerBox.asInt(0)
    const unitPrice = pricePerUnit.asInt(0)
    const bundlePrice = pricePerBundle.asInt(0)

    const stemsPerBox =
      unitKind === 'PIECE' ? units : bundles // в БД одно поле — трактуем как «кол-во упаковок»
    const pricePerBoxSeller =
      unitKind === 'PIECE' ? unitPrice * units : bundlePrice * bundles

    return { stemsPerBox, pricePerBoxSeller }
  }, [
    unitKind,
    piecesPerBox.value,
    bundlesPerBox.value,
    pricePerUnit.value,
    pricePerBundle.value,
  ])

  async function handleUploadFile(file: File) {
    setUploading(true)
    setError(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      // можете добавить dir=banners/products через query, если у вас так реализовано
      const res = await fetch(`/api/upload?dir=product-photos`, {
        method: 'POST',
        body: fd,
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j?.error || `HTTP ${res.status}`)
      }
      const data = (await res.json()) as UploadResponse
      if (!data?.url) throw new Error('Некорректный ответ загрузки')
      setPhotos((arr) => [...arr, data.url])
    } catch (e: any) {
      setError(e?.message || 'Не удалось загрузить файл')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setOk(false)
    setError(null)

    try {
      if (!name.trim()) throw new Error('Укажите название товара')
      if (!categoryId) throw new Error('Выберите категорию')
      if (calc.pricePerBoxSeller <= 0) {
        throw new Error('Заполните цену и количество в коробке')
      }

      const payload = {
        sellerId,
        categoryId,
        name: name.trim(),
        sku: generateSku(name),
        description: description.trim() || null,
        pricePerBoxSeller: calc.pricePerBoxSeller,
        stemsPerBox: calc.stemsPerBox,
        cutLengthCm: cutLength.asInt(0),
        color: color.trim() || null,
        country: country.trim() || null,
        photos, // массив ссылок
        stockStatus: 'AVAILABLE',
        sellerDiscountRub: 0,
        sellerCashbackRub: 0,
        unitKind, // если на бэке нет поля — можно проигнорировать, но оставим в черновике/модерации
      }

      // 1) Пытаемся обычным POST /seller/products
      const tryEndpoints: Array<{
        url: string
        body: any
      }> = [
        { url: `${API_BASE}/seller/products`, body: payload },
        { url: `${API_BASE}/products`, body: payload },
        // 2) Фоллбэк: через модерацию
        {
          url: `${API_BASE}/moderations`,
          body: {
            type: 'NEW_PRODUCT',
            sellerId,
            draft: payload,
          },
        },
      ]

      let success = false
      let lastError: string | null = null

      for (const { url, body } of tryEndpoints) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
          if (res.ok) {
            success = true
            break
          } else {
            const j = await res.json().catch(() => ({}))
            lastError = j?.error || `HTTP ${res.status}`
          }
        } catch (err: any) {
          lastError = err?.message || 'Сеть недоступна'
        }
      }

      if (!success) {
        throw new Error(lastError || 'Не удалось создать товар')
      }

      setOk(true)
      // Очистим форму
      setName('')
      setDescription('')
      setColor('')
      setCountry('')
      cutLength.set('')
      pricePerUnit.set('')
      pricePerBundle.set('')
      piecesPerBox.set('')
      bundlesPerBox.set('')
      setPhotos([])

      // Вернёмся к списку товаров продавца
      router.push('/seller/products')
    } catch (e: any) {
      setError(e?.message || 'Не удалось сохранить')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="mb-6 text-2xl font-semibold">Добавить товар</h1>

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
        {/* Левая колонка: основные поля */}
        <div className="space-y-4 lg:col-span-2">
          {/* Категория и название */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Категория</label>
              <select
                className="w-full rounded border px-3 py-2"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={catLoading || categories.length === 0}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {catError && <div className="mt-1 text-sm text-red-600">{catError}</div>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Название</label>
              <input
                className="w-full rounded border px-3 py-2"
                placeholder="Например, Роза Freedom 60 см"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Описание */}
          <div>
            <label className="mb-1 block text-sm font-medium">Описание</label>
            <textarea
              className="h-32 w-full rounded border px-3 py-2"
              placeholder="Краткое описание"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Характеристики */}
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">Цвет</label>
              <input
                className="w-full rounded border px-3 py-2"
                placeholder="красный"
                value={color}
                onChange={(e) => setColor(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Страна</label>
              <input
                className="w-full rounded border px-3 py-2"
                placeholder="Эквадор"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Ростовка, см</label>
              <input
                className="w-full rounded border px-3 py-2"
                placeholder="60"
                {...cutLength.bind}
              />
            </div>
          </div>

          {/* Упаковка/цены */}
          <div className="rounded-lg border p-4">
            <div className="mb-3 font-medium">Упаковка и цена</div>

            <div className="mb-3 flex gap-4">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  className="accent-black"
                  checked={unitKind === 'PIECE'}
                  onChange={() => setUnitKind('PIECE')}
                />
                <span>Штучно</span>
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  className="accent-black"
                  checked={unitKind === 'BUNDLE'}
                  onChange={() => setUnitKind('BUNDLE')}
                />
                <span>Пачками</span>
              </label>
            </div>

            {unitKind === 'PIECE' ? (
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Цена за 1 шт, ₽</label>
                  <input
                    className="w-full rounded border px-3 py-2"
                    placeholder="0"
                    {...pricePerUnit.bind}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Штук в коробке</label>
                  <input
                    className="w-full rounded border px-3 py-2"
                    placeholder="0"
                    {...piecesPerBox.bind}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Цена за коробку, ₽</label>
                  <input
                    className="w-full rounded border bg-gray-50 px-3 py-2"
                    value={calc.pricePerBoxSeller || ''}
                    readOnly
                    tabIndex={-1}
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Цена за пачку, ₽</label>
                  <input
                    className="w-full rounded border px-3 py-2"
                    placeholder="0"
                    {...pricePerBundle.bind}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Пачек в коробке</label>
                  <input
                    className="w-full rounded border px-3 py-2"
                    placeholder="0"
                    {...bundlesPerBox.bind}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Цена за коробку, ₽</label>
                  <input
                    className="w-full rounded border bg-gray-50 px-3 py-2"
                    value={calc.pricePerBoxSeller || ''}
                    readOnly
                    tabIndex={-1}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Фото */}
          <div className="rounded-lg border p-4">
            <div className="mb-3 font-medium">Фотографии</div>

            <div className="mb-3 flex items-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleUploadFile(f)
                }}
              />
              <button
                type="button"
                className="rounded bg-black px-4 py-2 text-white disabled:opacity-60"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? 'Загрузка…' : 'Добавить фото'}
              </button>
              <span className="text-sm text-gray-500">
                JPG/PNG, до 10 МБ. Загружается в <code>/api/upload</code>.
              </span>
            </div>

            {photos.length > 0 && (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {photos.map((src, i) => (
                  <div key={i} className="relative overflow-hidden rounded border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-32 w-full object-cover" />
                    <button
                      type="button"
                      className="absolute right-2 top-2 rounded bg-white/90 px-2 py-1 text-xs"
                      onClick={() =>
                        setPhotos((arr) => arr.filter((_, idx) => idx !== i))
                      }
                    >
                      Удалить
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Правая колонка: резюме/сохранение */}
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <div className="mb-3 font-medium">Итоги</div>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>
                Упаковка: {unitKind === 'PIECE' ? 'штучно' : 'пачками'}
              </li>
              <li>
                В коробке:{' '}
                {unitKind === 'PIECE'
                  ? `${piecesPerBox.asInt(0)} шт`
                  : `${bundlesPerBox.asInt(0)} пач.`}
              </li>
              <li>Ростовка: {cutLength.asInt(0) ? `${cutLength.asInt(0)} см` : '—'}</li>
              <li>Цена за коробку: {calc.pricePerBoxSeller || '—'} ₽</li>
            </ul>
          </div>

          {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {ok && <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">Черновик отправлен на модерацию</div>}

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 rounded bg-black px-4 py-2 text-white disabled:opacity-60"
              disabled={busy}
              title="Сохранить и отправить на модерацию"
            >
              {busy ? 'Сохраняем…' : 'Отправить на модерацию'}
            </button>
            <button
              type="button"
              className="rounded border px-4 py-2"
              onClick={() => router.push('/seller/products')}
              disabled={busy}
            >
              Отмена
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Поля с числами очищают ведущий «0» при фокусе. «Артикул» не запрашиваем — он
            генерируется автоматически на отправке.
          </p>
        </div>
      </form>
    </div>
  )
}
