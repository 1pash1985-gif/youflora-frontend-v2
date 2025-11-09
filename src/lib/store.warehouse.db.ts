// src/lib/store.warehouse.db.ts
import { apiGET, apiPOST, apiDELETE } from '@/lib/apiClient'
export type StockStatus = 'AVAILABLE' | 'PREORDER' | 'IN_TRANSIT'
export const STOCK_STATUSES: StockStatus[] = ['AVAILABLE','PREORDER','IN_TRANSIT']

export function initWarehouseSeedIfEmpty() { /* API mode: not used */ }

export async function getSellerCities(sellerId: string) {
  return apiGET(`/api/cities?sellerId=${encodeURIComponent(sellerId)}`)
}
export async function addCity(sellerId: string, name: string) {
  return apiPOST('/api/cities', { sellerId, name })
}
export async function deleteCity(id: string) {
  return apiDELETE(`/api/cities/${id}`)
}
export async function getWarehousesByCity(cityId: string) {
  return apiGET(`/api/warehouses?cityId=${encodeURIComponent(cityId)}`)
}
export async function getSellerWarehouses(sellerId: string) {
  return apiGET(`/api/warehouses?sellerId=${encodeURIComponent(sellerId)}`)
}
export async function addWarehouse(sellerId: string, cityId: string, name: string) {
  return apiPOST('/api/warehouses', { sellerId, cityId, name })
}
export async function deleteWarehouse(id: string) {
  return apiDELETE(`/api/warehouses/${id}`)
}
export async function getStockByWarehouse(warehouseId: string) {
  return apiGET(`/api/stock?warehouseId=${encodeURIComponent(warehouseId)}`)
}
export async function setStock(warehouseId: string, productId: string, qty: number, status: StockStatus = 'AVAILABLE', eta?: string) {
  return apiPOST('/api/stock', { warehouseId, productId, qty, status, eta })
}
export async function getProductStatusFlags(productId: string) {
  const r = await apiGET(`/api/status?productId=${encodeURIComponent(productId)}`)
  return r.flags as { AVAILABLE: boolean; PREORDER: boolean; IN_TRANSIT: boolean }
}
export async function getProductEarliestETA(productId: string) {
  const r = await apiGET(`/api/status?productId=${encodeURIComponent(productId)}`)
  return r.earliestInTransitEta as string | null
}
export async function getProductsMatchingStatuses(statuses: StockStatus[]) {
  const r = await apiGET(`/api/status/matching?statuses=${statuses.join(',')}`)
  return r.ids as string[]
}
export async function getCity(id: string) { return null }
export async function transferStock() { /* TODO */ }
