// src/components/AdminSidebar.tsx (полный, если у вас другой файл — вставьте пункты в массив)
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/admin/users', label: 'Пользователи' },
  { href: '/admin/sellers', label: 'Продавцы' },
  { href: '/admin/catalog', label: 'Товары и категории' },
  { href: '/admin/commission', label: 'Комиссия/Подтверждение' },
  { href: '/admin/global-cashback', label: 'Глобальный кэшбек' },
  { href: '/admin/order-statuses', label: 'Статусы заказов' },
  { href: '/admin/delivery-methods', label: 'Способы доставки' },
  { href: '/admin/payment-methods', label: 'Способы оплаты' },
  { href: '/admin/reviews', label: 'Отзывы' },
  { href: '/admin/support', label: 'Техподдержка' },      // <-- добавлено
  { href: '/admin/banners', label: 'Баннер' },            // <-- добавлено
  { href: '/admin/reports', label: 'Отчёты' },
]

export default function AdminSidebar() {
  const path = usePathname()
  return (
    <aside className="w-64 shrink-0">
      <nav className="flex flex-col gap-2">
        {items.map(it => (
          <Link key={it.href}
                href={it.href}
                className={`px-4 py-2 rounded ${path.startsWith(it.href) ? 'bg-blue-50 text-blue-600' : 'hover:bg-gray-50'}`}>
            {it.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
