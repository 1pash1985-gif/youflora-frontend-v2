'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
// ВАЖНО: так мы не «ломаемся», если каких‑то именованных экспортов нет.
// Дальше в коде всё вызываем через Warehouse.x?.()
import * as Warehouse from '@/lib/store.warehouse'

type City = { id: string; name: string; sellerId: string }
type WH = { id: string; name: string; cityId: string; sellerId: string }

function asArray<T>(x: any): T[] {
  return Array.isArray(x) ? x : []
}

export default function SellerWarehouses() {
  // Профиль продавца
  const profile =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem('seller_profile') || '{"sellerId":"s-ec"}')
      : { sellerId: 's-ec' }
  const sellerId: string = profile.sellerId || 's-ec'

  // Состояния
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [cities, setCities] = useState<City[]>([]) // всегда массив
  const [warehouses, setWarehouses] = useState<WH[]>([]) // всегда массив

  const [newCityName, setNewCityName] = useState('')
  const [newWHName, setNewWHName] = useState<Record<string, string>>({}) // {cityId: name}

  // Инициализация демо‑данных (если реализовано)
  useEffect(() => {
    try {
      Warehouse.initWarehouseSeedIfEmpty?.()
    } catch {}
  }, [])

  const refresh = async () => {
    setLoading(true)
    setError(null)
    try {
      // Города продавца
      const cList = await Promise.resolve(Warehouse.getSellerCities?.(sellerId))
      const cArr = asArray<City>(cList)
      setCities(cArr)

      // Склады: если есть getWarehousesByCity — получаем по каждому городу.
      // Иначе, если есть getSellerWarehouses — берём одним запросом.
      let whArr: WH[] = []
      if (Warehouse.getWarehousesByCity && cArr.length) {
        const perCity = await Promise.all(
          cArr.map((c) =>
            Promise.resolve(Warehouse.getWarehousesByCity!(sellerId, c.id)).then(asArray<WH>).catch(() => []),
          ),
        )
        whArr = perCity.flat()
      } else if (Warehouse.getSellerWarehouses) {
        const all = await Promise.resolve(Warehouse.getSellerWarehouses!(sellerId))
        whArr = asArray<WH>(all)
      }
      setWarehouses(whArr)
    } catch (e: any) {
      setError(e?.message || 'Не удалось загрузить города/склады')
      setCities([])
      setWarehouses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [sellerId])

  // Автообновление при изменениях из других вкладок (локальный режим)
  useEffect(() => {
    const onStorage = () => refresh()
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', onStorage)
      return () => window.removeEventListener('storage', onStorage)
    }
  }, [])

  // Группировка складов по городам — БЕЗ for..of по не-массивам
  const grouped = useMemo(() => {
    const map: Record<string, WH[]> = {}
    asArray<City>(cities).forEach((c) => (map[c.id] = []))
    asArray<WH>(warehouses).forEach((w) => {
      ;(map[w.cityId] = map[w.cityId] || []).push(w)
    })
    return map
  }, [cities, warehouses])

  // Действия
  const onAddCity = async () => {
    const name = newCityName.trim()
    if (!name) return alert('Введите название города')
    if (!Warehouse.addCity) return alert('Функция добавления города недоступна в текущей сборке')
    await Warehouse.addCity(sellerId, name)
    setNewCityName('')
    await refresh()
  }

  const onDeleteCity = async (id: string) => {
    if (!Warehouse.deleteCity) return alert('Удаление города недоступно в текущей сборке')
    if (!confirm('Удалить город и все его склады?')) return
    await Warehouse.deleteCity(id)
    await refresh()
  }

  const onAddWH = async (cityId: string) => {
    const name = (newWHName[cityId] || '').trim()
    if (!name) return alert('Введите название склада')
    if (!Warehouse.addWarehouse) return alert('Добавление склада недоступно в текущей сборке')
    await Warehouse.addWarehouse(sellerId, cityId, name)
    setNewWHName((p) => ({ ...p, [cityId]: '' }))
    await refresh()
  }

  const onDeleteWH = async (id: string) => {
    if (!Warehouse.deleteWarehouse) return alert('Удаление склада недоступно в текущей сборке')
    if (!confirm('Удалить склад?')) return
    await Warehouse.deleteWarehouse(id)
    await refresh()
  }

  // UI
  if (loading) return <div className="p-4">Загрузка…</div>
  if (error) return <div className="p-4 text-red-600">Ошибка: {error}</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-xl font-semibold">Города и склады продавца</div>
        <button className="rounded border px-3 py-2 hover:bg-gray-50" onClick={refresh}>
          Обновить
        </button>
      </div>

      {/* Добавить город */}
      <div className="card p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            className="input"
            placeholder="Новый город"
            value={newCityName}
            onChange={(e) => setNewCityName(e.target.value)}
          />
          <button className="btn-primary" onClick={onAddCity}>
            Добавить город
          </button>
        </div>
      </div>

      {/* Список городов со складами */}
      <div className="space-y-3">
        {asArray<City>(cities).length === 0 && (
          <div className="card p-4 text-gray-600">Пока нет городов. Добавьте первый.</div>
        )}

        {asArray<City>(cities).map((c) => {
          const wh = grouped[c.id] || []
          return (
            <div key={c.id} className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div className="font-medium">
                  {c.name}{' '}
                  <span className="text-xs text-gray-500">({wh.length} склад(ов))</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => onDeleteCity(c.id)}
                  >
                    Удалить город
                  </button>
                </div>
              </div>

              {/* Склады города */}
              <div className="border-t p-4">
                {wh.length === 0 ? (
                  <div className="mb-3 text-gray-600">Складов пока нет.</div>
                ) : (
                  <div className="grid gap-2 md:grid-cols-2">
                    {wh.map((w) => (
                      <div key={w.id} className="flex items-center justify-between rounded border p-3">
                        <div>
                          <div className="font-medium">{w.name}</div>
                          <div className="text-xs text-gray-500">ID: {w.id}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/seller/warehouses/${encodeURIComponent(w.id)}`}
                            className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
                          >
                            Открыть
                          </Link>
                          <button
                            className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
                            onClick={() => onDeleteWH(w.id)}
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Добавить склад в этот город */}
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                  <input
                    className="input"
                    placeholder="Название склада"
                    value={newWHName[c.id] || ''}
                    onChange={(e) =>
                      setNewWHName((p) => ({ ...p, [c.id]: e.target.value }))
                    }
                  />
                  <button className="btn-primary" onClick={() => onAddWH(c.id)}>
                    Добавить склад
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
