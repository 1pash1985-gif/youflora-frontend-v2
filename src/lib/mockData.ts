import type { Category, Product, Seller, Order } from './types'

export const sellers: Seller[] = [
  { id: 's-ec', name: 'ECUADOR CUTS', confirmationTimeoutMin: 90 },
  { id: 's-ken', name: 'KENYA BLOOMS' },
]

export const categories: Category[] = [
  { id: 'c-rose', name: 'Розы' },
  { id: 'c-chry', name: 'Хризантемы' },
]

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Роза Freedom 60см',
    sku: 'FR-60-EC',
    sellerId: 's-ec',
    categoryId: 'c-rose',
    photos: ['/images/rose1.png'],
    description: 'Классическая красная роза Freedom, длина 60 см. Поставка из Эквадора. Свежий срез.',
    stemsPerBox: 300,
    pricePerBoxSeller: 42000,
    sellerDiscountRub: 2000,
    cutLengthCm: 60,
    color: 'Красный',
    country: 'Эквадор',
    moderation: { status: 'APPROVED', updatedAt: new Date().toISOString() },
  },
  {
    id: 'p2',
    name: 'Роза Mondial 50см',
    sku: 'MO-50-KE',
    sellerId: 's-ken',
    categoryId: 'c-rose',
    photos: ['/images/rose2.png'],
    description: 'Белая роза Mondial, длина 50 см. Поставка из Кении. Для свадебных букетов.',
    stemsPerBox: 300,
    pricePerBoxSeller: 36000,
    cutLengthCm: 50,
    color: 'Белый',
    country: 'Кения',
    moderation: { status: 'APPROVED', updatedAt: new Date().toISOString() },
  },
]

export const demoOrder: Order = {
  id: 'ORD-100500',
  buyerCompany: 'ООО «ЦветСнаб»',
  sellerId: 's-ec',
  productLines: [{ productId: 'p1', boxes: 2 }],
  status: 'AWAIT_SELLER_CONFIRM',
  createdAt: new Date().toISOString(),
  confirmDeadlineAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  autoAction: 'auto_cancel',
}
