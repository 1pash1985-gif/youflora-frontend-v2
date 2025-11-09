// src/lib/cart.db.ts
import { apiGET, apiPOST, apiPATCH, apiDELETE } from '@/lib/apiClient'

export async function getCart(buyerId: string) {
  return apiGET(`/api/cart?buyerId=${encodeURIComponent(buyerId)}`)
}
export async function addToCart(buyerId: string, productId: string, qty = 1) {
  return apiPOST('/api/cart', { buyerId, productId, qty })
}
export async function updateCartItem(itemId: string, qty: number) {
  return apiPATCH(`/api/cart/item/${itemId}`, { qty })
}
export async function removeCartItem(itemId: string) {
  return apiDELETE(`/api/cart/item/${itemId}`)
}
export async function clearCart(buyerId: string) {
  return apiDELETE(`/api/cart?buyerId=${encodeURIComponent(buyerId)}`)
}

export async function previewCheckout(buyerId: string, spendBySeller: Record<string, number> = {}) {
  return apiPOST('/api/checkout/preview', { buyerId, spendBySeller })
}
export async function placeOrder(params: {
  buyerId: string,
  deliveryMethod?: string,
  paymentMethod?: string,
  address?: any,
  spendBySeller?: Record<string, number>
}) {
  return apiPOST('/api/checkout/place', params)
}

export async function listOrdersByBuyer(buyerId: string) {
  return apiGET(`/api/orders?buyerId=${encodeURIComponent(buyerId)}`)
}
export async function listOrdersBySeller(sellerId: string) {
  return apiGET(`/api/orders?sellerId=${encodeURIComponent(sellerId)}`)
}
export async function getOrder(id: string) {
  return apiGET(`/api/orders/${id}`)
}
export async function sellerConfirm(orderId: string, sellerId: string, approve: boolean) {
  return apiPOST(`/api/orders/${orderId}/seller-confirm`, { sellerId, approve })
}
export async function cancelOrder(orderId: string) {
  return apiPOST(`/api/orders/${orderId}/cancel`, {})
}
