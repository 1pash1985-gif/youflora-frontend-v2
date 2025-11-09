// src/components/ProductCard.tsx
'use client'

export default function ProductCard({ product }: { product: any }) {
  const photo =
    Array.isArray(product?.photos) && product.photos.length
      ? product.photos[0]
      : '/images/placeholder.png'

  const price = product?.pricePerBoxSeller ?? 0
  const discount = product?.sellerDiscountRub ?? 0
  const finalPrice = price - discount

  return (
    <div className="card p-3 space-y-2">
      <img src={photo} alt={product?.name ?? ''} className="h-44 w-full object-cover rounded-lg border" />
      <div className="text-sm text-gray-500">{product?.country} · {product?.cutLengthCm ?? '-'} см</div>
      <div className="font-medium line-clamp-2">{product?.name}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-lg font-semibold">{finalPrice.toLocaleString()} ₽</div>
        {discount > 0 && <div className="text-sm text-gray-500 line-through">{price.toLocaleString()} ₽</div>}
      </div>
      <button className="btn-primary w-full">В корзину</button>
    </div>
  )
}
