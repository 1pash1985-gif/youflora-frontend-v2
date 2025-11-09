'use client'
const KEY = 'cashback_wallet'
export type Wallet = { global: number; bySeller: Record<string, number> }
const defaultWallet: Wallet = { global: 0, bySeller: {} }
export function getWallet(): Wallet { if (typeof window === 'undefined') return defaultWallet; const raw = localStorage.getItem(KEY); if (!raw) { localStorage.setItem(KEY, JSON.stringify(defaultWallet)); return defaultWallet } try { return JSON.parse(raw) } catch { return defaultWallet } }
export function setWallet(w: Wallet) { if (typeof window === 'undefined') return; localStorage.setItem(KEY, JSON.stringify(w)) }
export function addSellerCashback(sellerId: string, amount: number) { const w = getWallet(); w.bySeller[sellerId] = (w.bySeller[sellerId] || 0) + Math.max(0, amount); setWallet(w) }
export function addGlobalCashback(amount: number) { const w = getWallet(); w.global += Math.max(0, amount); setWallet(w) }
export function applySellerCashback(sellerId: string, amount: number) { const w = getWallet(); const have = w.bySeller[sellerId] || 0; const used = Math.min(have, Math.max(0, amount)); w.bySeller[sellerId] = have - used; setWallet(w); return used }
