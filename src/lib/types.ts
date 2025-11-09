export type ModerationStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED'

export type Seller = {
  id: string
  name: string
  confirmationTimeoutMin?: number
}

export type Category = {
  id: string
  name: string
}

export type Product = {
  id: string
  name: string
  sku: string
  sellerId: string
  categoryId: string
  photos: string[]
  description?: string
  stemsPerBox: number
  pricePerBoxSeller: number
  sellerDiscountRub?: number
  sellerCashbackRub?: number
  cutLengthCm?: number
  color?: string
  country?: string
  moderation?: { status: ModerationStatus; updatedAt: string; reason?: string }
}

export type CommissionConfig = {
  roundingStepRub: 1 | 10 | 0.01
  globalPercent: number
  byCategory: Record<string, number | undefined>
  bySeller: Record<string, number | undefined>
  byProduct: Record<string, number | undefined>
}

export type Order = {
  id: string
  buyerCompany: string
  sellerId: string
  productLines: { productId: string; boxes: number }[]
  status: 'AWAIT_SELLER_CONFIRM' | 'CONFIRMED_BY_SELLER' | 'REJECTED_BY_SELLER' | 'AUTO_CANCELLED' | 'AUTO_ACCEPTED'
  createdAt: string
  confirmDeadlineAt?: string
  autoAction: 'auto_cancel' | 'auto_accept'
}
