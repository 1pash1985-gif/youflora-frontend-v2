/* src/lib/store.warehouse.ts
 * Унифицированный слой для остатков/складов/доступности товара.
 * Работает в двух режимах:
 * 1) через API (NEXT_PUBLIC_API_BASE=/api/v1),
 * 2) безопасные заглушки + кэш в sessionStorage/localStorage (не падаем даже без API).
 */

export type StatusFlags = {
  AVAILABLE: boolean
  PREORDER: boolean
  IN_TRANSIT: boolean
}

export type CityAvailability = {
  cityId: string
  cityName: string
  totalBoxes: number
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '/api/v1'

// Универсальный fetch с fallback
async function fetchSafe<T>(url: string, fallback: T): Promise<T> {
  try {
    const r = await fetch(url, { cache: 'no-store' })
    if (!r.ok) return fallback
    return (await r.json()) as T
  } catch {
    return fallback
  }
}

/** ---------- СТАТУСЫ ТОВАРА ---------- */

/** Синхронная «наследуемая» версия для старых мест, где ожидается sync‑возврат. */
export function getProductStatusFlagsSync(productId: string): StatusFlags {
  if (typeof window === 'undefined') {
    return { AVAILABLE: false, PREORDER: false, IN_TRANSIT: false }
  }
  try {
    const raw = sessionStorage.getItem(`yf_status_${productId}`)
    return raw
      ? (JSON.parse(raw) as StatusFlags)
      : { AVAILABLE: false, PREORDER: false, IN_TRANSIT: false }
  } catch {
    return { AVAILABLE: false, PREORDER: false, IN_TRANSIT: false }
  }
}

/** Актуальная версия: тянет из API, с кэшем; не валит интерфейс, если API недоступно. */
export async function getProductStatusFlags(productId: string): Promise<StatusFlags> {
  const fallback = getProductStatusFlagsSync(productId)
  const data = await fetchSafe<StatusFlags>(
    `${API_BASE}/stock/status-flags?productId=${encodeURIComponent(productId)}`,
    fallback
  )
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(`yf_status_${productId}`, JSON.stringify(data))
  }
  return data
}

/** Ранняя оценка ETA (используется в карточках при IN_TRANSIT/PREORDER) */
export function getProductEarliestETA(
  productId: string,
  status: 'IN_TRANSIT' | 'PREORDER'
): string | null {
  if (typeof window === 'undefined') return null
  try {
    // если бэкенд будет присылать ETA, можно положить сюда из fetch‑обновлений
    return localStorage.getItem(`yf_eta_${productId}_${status}`)
  } catch {
    return null
  }
}

/** ---------- ДОСТУПНОСТЬ ПО ГОРОДАМ ---------- */

export function getProductCityAvailability(productId: string): CityAvailability[] {
  // синхронный вариант для совместимости со старым кодом
  if (typeof window === 'undefined') return []
  try {
    const raw = sessionStorage.getItem(`yf_city_av_${productId}`)
    return raw ? (JSON.parse(raw) as CityAvailability[]) : []
  } catch {
    return []
  }
}

/** Асинхронный вариант — если нужно получать живые данные из API. */
export async function getProductCityAvailabilityAsync(
  productId: string
): Promise<CityAvailability[]> {
  const fallback = getProductCityAvailability(productId)
  const data = await fetchSafe<CityAvailability[]>(
    `${API_BASE}/stock/city-availability?productId=${encodeURIComponent(productId)}`,
    fallback
  )
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(`yf_city_av_${productId}`, JSON.stringify(data))
  }
  return data
}

/** ---------- УТИЛИТЫ ДЛЯ СКЛАДОВ (заглушки для совместимости) ---------- */

// если где‑то в проекте вызовут эти функции — они будут существовать и безопасны

export function setStock() {
  /* no-op до полного перевода на API */
}

export function transferStock() {
  /* no-op до полного перевода на API */
}
