'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Product } from '@/lib/types'
import { addModeration } from '@/lib/store'
import * as Warehouse from '@/lib/store.warehouse'

/** Безопасное приведение к массиву */
function asArray<T>(x: any, path?: string): T[] {
  if (path && x && Array.isArray((x as any)[path])) return (x as any)[path]
  return Array.isArray(x) ? x : []
}

type Props = {
  sellerId: string
  categories: { id: string; name: string }[]
  onCreated?: (tmpProduct: Product) => void
}

type StockStatus = 'AVAILABLE' | 'PREORDER' | 'IN_TRANSIT'

export default function ProductCreateCard({ sellerId, categories, onCreated }: Props) {
  // ---- основные поля
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id ?? '')
  const [uniqueName, setUniqueName] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [sku, setSku] = useState('')
  const [pricePerBoxSeller, setPrice] = useState<number>(0)
  const [country, setCountry] = useState('')
  const [status, setStatus] = useState<StockStatus>('AVAILABLE') // В наличии / Под заказ / В пути
  const [plantation, setPlantation] = useState('')
  const [vatIncluded, setVatIncluded] = useState<boolean | null>(null)
  const [unit, setUnit] = useState('шт') // единица измерения
  const [cutLengthCm, setCutLength] = useState<number>(60) // ростовка
  const [color, setColor] = useState('')
  const [weightGram, setWeight] = useState<number | ''>('') // граммовка (необяз.)
  const [volume, setVolume] = useState<number | ''>('') // объём (необяз.)
  const [stemsPerBox, setStemsPerBox] = useState<number>(300) // ед. в коробке

  // ---- остатки / склады
  const [cities, setCities] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [cityId, setCityId] = useState<string | undefined>(undefined)
  const [warehouseId, setWarehouseId] = useState<string | undefined>(undefined)
  const [qtyBoxes, setQtyBoxes] = useState<number>(0)

  // ---- фото до 11 шт.
  const [photos, setPhotos] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const maxPhotos = 11
  const canAddMore = photos.length < maxPhotos

  useEffect(() => {
    // подгрузим справочники складов (если модуль есть)
    ;(async () => {
      try {
        const cs = await Promise.resolve(Warehouse.getSellerCities?.(sellerId))
        const cArr = asArray<any>(cs)
        setCities(cArr)
        if (cArr.length) {
          setCityId(cArr[0].id)
          const wh = await Promise.resolve(Warehouse.getWarehousesByCity?.(sellerId, cArr[0].id))
          const wArr = asArray<any>(wh)
          setWarehouses(wArr)
          setWarehouseId(wArr[0]?.id)
        }
      } catch {}
    })()
  }, [sellerId])

  const cityWarehouses = useMemo(
    () => warehouses.filter((w) => !cityId || w.cityId === cityId),
    [warehouses, cityId],
  )

  // ---- загрузка фото
  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const left = maxPhotos - photos.length
    const toRead = Array.from(files).slice(0, left)
    const arr = await Promise.all(
      toRead.map(
        (f) =>
          new Promise<string>((res) => {
            const r = new FileReader()
            r.onload = () => res(String(r.result))
            r.readAsDataURL(f)
          }),
      ),
    )
    setPhotos((p) => [...p, ...arr])
  }
  const removePhoto = (idx: number) => {
    setPhotos((p) => p.filter((_, i) => i !== idx))
  }

  // ---- валидация
  const validate = (): string | null => {
    if (!categoryId) return 'Выберите категорию'
    if (!name.trim()) return 'Заполните название'
    if (!sku.trim()) return 'Укажите артикул'
    if (!pricePerBoxSeller || pricePerBoxSeller <= 0) return 'Укажите цену'
    if (!country.trim()) return 'Укажите страну'
    if (!unit) return 'Выберите единицу измерения'
    if (!stemsPerBox || stemsPerBox <= 0) return 'Укажите количество единиц в коробке'
    // склады не обязательны — можно добавить позже
    return null
  }

  // ---- отправка на модерацию
  const submit = async () => {
    const err = validate()
    if (err) return alert(err)

    const tmpId = 'tmp-' + Date.now()
    const prod: Product = {
      id: tmpId,
      sellerId,
      categoryId,
      name: name.trim(),
      sku: sku.trim(),
      description: description.trim(),
      pricePerBoxSeller: Number(pricePerBoxSeller),
      photos: photos.length ? photos : ['/images/placeholder.png'],
      stemsPerBox: Number(stemsPerBox),
      cutLengthCm: Number(cutLengthCm),
      color: color.trim(),
      country: country.trim(),
      // дополнительные поля (не мешают типу Product)
      ...(status ? { stockStatus: status } : {}),
      ...(plantation ? { plantation } : {}),
      ...(vatIncluded !== null ? { vatIncluded } : {}),
      ...(unit ? { unit } : {}),
      ...(weightGram !== '' ? { weightGram: Number(weightGram) } : {}),
      ...(volume !== '' ? { volume: Number(volume) } : {}),
      ...(uniqueName ? { uniqueName } : {}),
    } as any

    // на модерацию — обязательно
    addModeration({
      id: 'mod-' + Date.now(),
      type: 'NEW_PRODUCT',
      sellerId,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      draft: prod,
      fieldsChanged: ['name', 'sku', 'photos', 'description'],
    })
    // стартовый остаток — по возможности
    try {
      if (warehouseId && qtyBoxes > 0) {
        await Promise.resolve(Warehouse.setStock?.(warehouseId, tmpId, qtyBoxes))
      }
    } catch {}

    alert('Товар отправлен на модерацию')
    onCreated?.(prod)

    // сброс
    setName('')
    setDescription('')
    setSku('')
    setPrice(0)
    setCountry('')
    setStatus('AVAILABLE')
    setPlantation('')
    setVatIncluded(null)
    setUnit('шт')
    setCutLength(60)
    setColor('')
    setWeight('')
    setVolume('')
    setStemsPerBox(300)
    setQtyBoxes(0)
    setPhotos([])
  }

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 text-lg font-semibold">Создание товара</div>
      <div className="grid gap-4 border-t p-4 md:grid-cols-2">
        {/* левая колонка */}
        <div className="space-y-3">
          <div>
            <select className="input" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <input id="uniq" type="checkbox" checked={uniqueName} onChange={(e) => setUniqueName(e.target.checked)} />
              <label htmlFor="uniq" className="text-gray-600">
                Уникальное название
              </label>
            </div>
          </div>

          <div>
            <div className="relative">
              <input className="input pr-10" placeholder="Название*" value={name} onChange={(e) => setName(e.target.value)} />
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">⌄</span>
            </div>
            <div className="mt-1 text-[12px] text-gray-500">* поиск названия происходит от 3 символов</div>
          </div>

          <textarea className="input h-28" placeholder="Описание" value={description} onChange={(e) => setDescription(e.target.value)} />

          <input className="input" placeholder="Артикул" value={sku} onChange={(e) => setSku(e.target.value)} />

          <input
            type="number"
            className="input"
            placeholder="Цена*"
            value={pricePerBoxSeller}
            min={0}
            onChange={(e) => setPrice(Number(e.target.value))}
          />

          {/* старая цена — УДАЛЕНО по вашему требованию */}

          <input
            type="number"
            className="input"
            placeholder="Граммовка"
            value={weightGram}
            min={0}
            onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
          />

          <input
            type="number"
            className="input"
            placeholder="Объём"
            value={volume}
            min={0}
            onChange={(e) => setVolume(e.target.value === '' ? '' : Number(e.target.value))}
          />

          <div>
            <select
              className="input"
              value={cutLengthCm}
              onChange={(e) => setCutLength(Number(e.target.value))}
            >
              {[40, 50, 60, 70, 80].map((n) => (
                <option key={n} value={n}>
                  Ростовка* {n} см
                </option>
              ))}
            </select>
          </div>

          <div>
            <input className="input" placeholder="Цвет*" value={color} onChange={(e) => setColor(e.target.value)} />
          </div>
        </div>

        {/* правая колонка */}
        <div className="space-y-3">
          <input className="input" placeholder="Страна*" value={country} onChange={(e) => setCountry(e.target.value)} />

          <select
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value as StockStatus)}
          >
            <option value="AVAILABLE">Статус*: В наличии</option>
            <option value="PREORDER">Статус*: Под заказ</option>
            <option value="IN_TRANSIT">Статус*: В пути</option>
          </select>

          <input className="input" placeholder="Плантация" value={plantation} onChange={(e) => setPlantation(e.target.value)} />

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">НДС*</div>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="vat" checked={vatIncluded === true} onChange={() => setVatIncluded(true)} /> Да
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="vat" checked={vatIncluded === false} onChange={() => setVatIncluded(false)} /> Нет
            </label>
          </div>

          <select className="input" value={unit} onChange={(e) => setUnit(e.target.value)}>
            {['шт', 'коробка', 'пучок', 'упаковка'].map((u) => (
              <option key={u} value={u}>
                Единица измерения*: {u}
              </option>
            ))}
          </select>

          {/* Остатки */}
          <div className="mt-4 text-sm font-medium">Остатки</div>

          <div>
            <div className="flex items-center justify-between">
              <select
                className="input flex-1"
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                disabled={cityWarehouses.length === 0}
              >
                {cityWarehouses.length === 0 && <option>Складов нет</option>}
                {cityWarehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
              <a href="/seller/warehouses" className="ml-3 text-sm text-green-700 hover:underline">
                создать склад
              </a>
            </div>
          </div>

          <input
            type="number"
            className="input"
            placeholder="Количество коробок*"
            value={qtyBoxes}
            min={0}
            onChange={(e) => setQtyBoxes(Number(e.target.value || 0))}
          />

          <input
            type="number"
            className="input"
            placeholder="Количество единиц в коробке*"
            value={stemsPerBox}
            min={1}
            onChange={(e) => setStemsPerBox(Number(e.target.value))}
          />
        </div>

        {/* Фото */}
        <div className="md:col-span-2">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-medium">
              Фото {photos.length}/{maxPhotos}
            </div>
            <button
              type="button"
              className="text-sm text-green-700 hover:underline"
              onClick={() => fileInputRef.current?.click()}
              disabled={!canAddMore}
            >
              Добавить фото
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
            {photos.map((src, i) => (
              <div key={i} className="relative h-24 w-full rounded border bg-white">
                <img src={src} className="h-full w-full rounded object-cover" />
                <button
                  type="button"
                  className="absolute right-1 top-1 rounded bg-white/90 px-1 text-xs"
                  onClick={() => removePhoto(i)}
                >
                  ×
                </button>
              </div>
            ))}
            {Array.from({ length: Math.max(0, maxPhotos - photos.length) }).map((_, idx) => (
              <button
                key={`ph-${idx}`}
                type="button"
                className="flex h-24 w-full items-center justify-center rounded border text-2xl text-gray-400"
                onClick={() => fileInputRef.current?.click()}
                disabled={!canAddMore}
              >
                +
              </button>
            ))}
          </div>
        </div>

        {/* кнопки */}
        <div className="md:col-span-2 flex items-center justify-between">
          <button
            type="button"
            className="rounded border px-4 py-2 hover:bg-gray-50"
            onClick={() => {
              // сброс всей формы
              setCategoryId(categories[0]?.id ?? '')
              setUniqueName(false)
              setName('')
              setDescription('')
              setSku('')
              setPrice(0)
              setCountry('')
              setStatus('AVAILABLE')
              setPlantation('')
              setVatIncluded(null)
              setUnit('шт')
              setCutLength(60)
              setColor('')
              setWeight('')
              setVolume('')
              setStemsPerBox(300)
              setQtyBoxes(0)
              setPhotos([])
            }}
          >
            Отмена
          </button>
          <button type="button" className="btn-primary" onClick={submit}>
            Добавить
          </button>
        </div>
      </div>
    </div>
  )
}
