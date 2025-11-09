'use client'
import { FiSearch } from 'react-icons/fi'

export const SearchBar: React.FC = () => {
  return (
    <div className="flex-1 flex items-center gap-2">
      <div className="relative flex-1">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
        <input className="input w-full pl-10" placeholder="Поиск: роза 60 см, Эквадор, сорт Freedom…" />
      </div>
      <button className="btn-primary">Найти</button>
    </div>
  )
}
