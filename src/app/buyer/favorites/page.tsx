'use client'
import { useFavorites } from '@/providers/FavoritesProvider'
import { useCatalogProducts } from '@/lib/catalog'
import { ProductCard } from '@/components/ProductCard'
export default function BuyerFavorites() {
  const { favs } = useFavorites()
  const { list } = useCatalogProducts(true)
  const items = list.filter(p => favs.has(p.id))
  return (
    <div>
      <div className="text-xl font-semibold mb-4">Избранные товары</div>
      {items.length === 0 ? <div className="card p-6 text-gray-600">Пока пусто.</div> :
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {items.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      }
    </div>
  )
}
