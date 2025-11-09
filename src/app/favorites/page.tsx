'use client'
import { useFavorites } from '@/providers/FavoritesProvider'
import { initCatalogIfEmpty, getCatalog } from '@/lib/store'
import { products } from '@/lib/mockData'
import { ProductCard } from '@/components/ProductCard'
export default function Favorites(){
  initCatalogIfEmpty(products)
  const list = typeof window!=='undefined'? getCatalog(): products
  const { favs } = useFavorites()
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
