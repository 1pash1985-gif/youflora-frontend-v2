'use client'
export default function BuyerNotifications() {
  const items = [
    { dt:'10.11.2022 / 10:53', text:'Вы оформили заказ №1025 на сумму 8 000 руб.'},
    { dt:'10.11.2022 / 10:54', text:'Вы получили 300 руб. в виде кэшбека за заказ №1025'},
  ]
  return (
    <div className="space-y-3">
      <div className="text-xl font-semibold">Уведомления</div>
      {items.map((n, i) => (
        <div key={i} className="card p-4">
          <div className="text-sm text-gray-500">{n.dt}</div>
          <div>{n.text}</div>
        </div>
      ))}
    </div>
  )
}
