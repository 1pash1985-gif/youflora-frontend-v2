import { DashboardLayout } from '@/components/DashboardLayout'
export default function AdminLayout({ children }:{children:React.ReactNode}) {
  const menu = [
    { href:'/admin/users', label:'Пользователи' },
    { href:'/admin/sellers', label:'Продавцы' },
    { href:'/admin/products', label:'Товары и категории' },
    { href:'/admin/commission', label:'Комиссия/Подтверждение' },
    { href:'/admin/cashback', label:'Глобальный кэшбек' },
    { href:'/admin/order-statuses', label:'Статусы заказов' },
    { href:'/admin/delivery-methods', label:'Способы доставки' },
    { href:'/admin/payment-methods', label:'Способы оплаты' },
    { href:'/admin/reviews', label:'Отзывы' },
    { href:'/admin/banners', label:'Баннеры' },
    { href:'/admin/support', label:'Техподдержка' },
    { href:'/admin/reports', label:'Отчеты' },
    { href:'/admin/roles', label:'Роли и доступы' },
    { href:'/admin/ofd', label:'Интеграция OFD' },
    { href:'/admin/onec', label:'Интеграция 1С' },
    { href:'/admin/crm', label:'CRM' },
    { href:'/admin/call-tracking', label:'Подмена номеров' },
  ]
  return <DashboardLayout title="Админ‑панель" menu={menu}>{children}</DashboardLayout>
}
