'use client'
import { useAuth } from '@/providers/AuthProvider'
export default function BuyerProfile() {
  const { user, setUser } = useAuth()
  return (
    <div className="card p-6 space-y-4">
      <div className="text-xl font-semibold">Профиль</div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600">ФИО</label>
          <input className="input w-full" value={user.name} onChange={e=>setUser({name:e.target.value})} />
        </div>
        <div>
          <label className="text-sm text-gray-600">Компания</label>
          <input className="input w-full" value={user.company ?? ''} onChange={e=>setUser({company:e.target.value})} />
        </div>
      </div>
      <div className="text-sm text-gray-600">Сумма накопленного кэшбека: <b>0 ₽</b> (демо)</div>
    </div>
  )
}
