import type { Order } from '@/lib/types'
export const StatusBadge = ({ status }: { status: Order['status'] }) => {
  const map: Record<Order['status'], string> = {
    AWAIT_SELLER_CONFIRM: 'Ожидает подтверждения продавца',
    CONFIRMED_BY_SELLER: 'Подтверждён продавцом',
    REJECTED_BY_SELLER: 'Отклонён продавцом',
    AUTO_ACCEPTED: 'Автопринят',
    AUTO_CANCELLED: 'Автоотменён',
  }
  const color: Record<Order['status'], string> = {
    AWAIT_SELLER_CONFIRM: 'bg-yellow-100 text-yellow-800',
    CONFIRMED_BY_SELLER: 'bg-green-100 text-green-800',
    REJECTED_BY_SELLER: 'bg-red-100 text-red-800',
    AUTO_ACCEPTED: 'bg-blue-100 text-blue-800',
    AUTO_CANCELLED: 'bg-gray-100 text-gray-800',
  }
  return <span className={`badge ${color[status]}`}>{map[status]}</span>
}
