'use client'
import { FiHeart } from 'react-icons/fi'
import { useFavorites } from '@/providers/FavoritesProvider'

export const FavoriteButton = ({ productId }:{productId:string}) => {
  const { favs, toggle } = useFavorites()
  const active = favs.has(productId)
  return (
    <button
      onClick={(e)=>{ e.preventDefault(); toggle(productId)}}
      className={`absolute top-2 right-2 rounded-full p-2 bg-white/90 hover:bg-white ${active ? 'text-ozon-blue' : 'text-gray-500'}`}
      aria-label={active ? 'Убрать из избранного' : 'В избранное'}
      title={active ? 'Убрать из избранного' : 'В избранное'}
    >
      <FiHeart />
    </button>
  )
}
