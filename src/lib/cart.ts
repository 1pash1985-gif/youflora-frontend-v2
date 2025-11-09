// src/lib/cart.ts
type CartItem = { productId: string; qty: number }
const KEY = 'cart_items'

function read(): CartItem[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(KEY)
  return raw ? JSON.parse(raw) : []
}
function write(arr: CartItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(arr))
  window.dispatchEvent(new StorageEvent('storage', { key: KEY }))
}

export function addToCart(productId: string, qty = 1) {
  const arr = read()
  const i = arr.findIndex(x => x.productId === productId)
  if (i >= 0) arr[i].qty += qty
  else arr.push({ productId, qty })
  write(arr)
}
export function removeFromCart(productId: string) {
  write(read().filter(x => x.productId !== productId))
}
export function setQty(productId: string, qty: number) {
  const arr = read()
  const i = arr.findIndex(x => x.productId === productId)
  if (i >= 0) { arr[i].qty = qty <= 0 ? 1 : qty; write(arr) }
}
export function getCart() { return read() }
export function clearCart() { write([]) }
