'use client'
import AdminModerationPage from '../moderation/page'

export default function AdminProductsAndCategories() {
  // Переиспользуем таблицу модерации.
  // Позже при желании распакуем в отдельные вкладки «Каталог» / «Категории».
  return <AdminModerationPage />
}
