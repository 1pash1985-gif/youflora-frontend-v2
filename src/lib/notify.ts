'use client'
export type NotificationItem = { id: string; dt: string; title: string; body?: string; read?: boolean }
const key = (sellerId: string) => `notifications_seller_${sellerId}`
export function getSellerNotifications(sellerId: string): NotificationItem[] { if (typeof window === 'undefined') return []; const raw = localStorage.getItem(key(sellerId)); return raw ? JSON.parse(raw) : [] }
export function pushSellerNotification(sellerId: string, title: string, body?: string) { if (typeof window === 'undefined') return; const list = getSellerNotifications(sellerId); list.unshift({ id: 'n-'+Date.now(), dt: new Date().toISOString(), title, body, read: false }); localStorage.setItem(key(sellerId), JSON.stringify(list)) }
export function markAllSellerRead(sellerId: string) { const list = getSellerNotifications(sellerId).map(n => ({ ...n, read: true })); localStorage.setItem(key(sellerId), JSON.stringify(list)) }
