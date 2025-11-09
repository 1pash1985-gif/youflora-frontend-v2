'use client'
import { useParams } from 'next/navigation'
import { useCatalogProducts } from '@/lib/catalog'
import { Price } from '@/components/Price'

export default function ProductDetailPage(){
  const params = useParams<{ id: string }>()
  const { list } = useCatalogProducts(true)
  const product = list.find(p => p.id === params.id)

  if (!product) {
    return <div className="card p-6">Товар не найден или находится на модерации.</div>
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card p-3">
        <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-50">
          <img alt={product.name} src={product.photos[0] ?? '/images/placeholder.png'} className="w-full h-full object-cover" />
        </div>
        {product.photos.length > 1 && (
          <div className="flex gap-2 mt-3">
            {product.photos.slice(1).map((ph, i) => (
              <img key={i} src={ph} className="w-20 h-16 object-cover rounded border" />
            ))}
          </div>
        )}
      </div>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <div className="text-sm text-gray-600">SKU: {product.sku} · {product.cutLengthCm ?? '-'} см · {product.country}</div>

        <Price product={product} />

        {product.description && (
          <div className="card p-4">
            <div className="font-semibold mb-1">Описание</div>
            <div className="text-sm text-gray-700 whitespace-pre-line">{product.description}</div>
          </div>
        )}

        <div className="card p-4">
          <div className="font-semibold mb-1">Характеристики</div>
          <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
            <li>Длина стебля: {product.cutLengthCm ?? '-' } см</li>
            <li>Цвет: {product.color ?? '-'}</li>
            <li>Страна/плантация: {product.country ?? '-'}</li>
            <li>Стеблей в коробке: {product.stemsPerBox}</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <button className="btn-primary">Добавить в корзину</button>
          <button className="border border-gray-200 rounded-lg px-4">В избранное</button>
        </div>
      </div>
    </div>
  )
}


const AvailabilityCities = ({ productId }:{productId:string}) => {
  if (typeof window === 'undefined') return null
  const list = getProductCityAvailability(productId)
  return (
    <div className="card p-4">
      <div className="font-semibold mb-2">Наличие по городам</div>
      {list.length===0 ? <div className="text-sm text-gray-600">Нет наличия на складах</div> :
        <ul className="text-sm text-gray-700 list-disc pl-5 space-y-1">
          {list.map(a => (<li key={a.cityId}>{a.city} — {a.boxes} кор.</li>))}
        </ul>
      }
    </div>
  )
}
