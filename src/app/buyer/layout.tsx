import { DashboardLayout } from '@/components/DashboardLayout'
export default function BuyerLayout({ children }:{children:React.ReactNode}) {
  const menu = [
    { href: '/buyer/profile', label: 'Профиль' },
    { href: '/buyer/orders', label: 'Заказы' },
    { href: '/buyer/returns', label: 'Возвраты' },
    { href: '/buyer/favorites', label: 'Избранные товары' },
    { href: '/buyer/addresses', label: 'Адреса доставки' },
    { href: '/buyer/notifications', label: 'Уведомления' },
    { href: '/buyer/reports', label: 'Отчеты' },
    { href: '/buyer/balance', label: 'Баланс (этап 2)' },
  ]
  return <DashboardLayout title="Кабинет покупателя" menu={menu}>{children}</DashboardLayout>
}
