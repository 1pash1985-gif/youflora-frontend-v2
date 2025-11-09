import type { CommissionConfig, Product } from './types'

export function resolveCommissionPercent(p: Product, cfg: CommissionConfig) {
  return (
    cfg.byProduct[p.id] ??
    cfg.bySeller[p.sellerId] ??
    cfg.byCategory[p.categoryId] ??
    cfg.globalPercent
  ) ?? cfg.globalPercent
}

export function roundPrice(x: number, step: number) {
  const s = step === 0.01 ? 0.01 : step
  return Math.round(x / s) * s
}

export function calcBuyerPricePerBox(p: Product, cfg: CommissionConfig) {
  const Ps = p.pricePerBoxSeller
  const Ds = p.sellerDiscountRub ?? 0
  const C = resolveCommissionPercent(p, cfg) / 100
  const raw = (Ps - Ds) + Ps * C
  return roundPrice(raw, cfg.roundingStepRub)
}

export function calcBuyerPricePerStem(p: Product, cfg: CommissionConfig) {
  const perBox = calcBuyerPricePerBox(p, cfg)
  return +(perBox / Math.max(1, p.stemsPerBox)).toFixed(2)
}
