import Link from 'next/link'

const items = [
  { href: '/seller/profile',       label: 'Профиль' },
  { href: '/seller/orders',        label: 'Заказы' },
  { href: '/seller/products',      label: 'Товары' },
  { href: '/seller/import',        label: 'Импорт товаров' },
  { href: '/seller/warehouses',    label: 'Склады' },
  { href: '/seller/stock',         label: 'Остатки' },
  { href: '/seller/reviews',       label: 'Отзывы' },
  { href: '/seller/reports',       label: 'Отчеты' },
  { href: '/seller/notifications', label: 'Уведомления' },
  { href: '/seller/support',       label: 'Тикеты в поддержку' }, // ← новый пункт
  { href: '/seller/balance',       label: 'Баланс (этап 2)' },
]

export default function SellerSidebar() {
  return (
    <aside className="w-64 shrink-0">
      <div className="rounded-lg border bg-white p-4">
        <div className="mb-4 text-lg font-semibold">Кабинет продавца</div>
        <nav className="space-y-2">
          {items.map((i) => (
            <Link
              key={i.href}
              className="block rounded px-3 py-2 hover:bg-gray-50"
              href={i.href}
            >
              {i.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  )
}
