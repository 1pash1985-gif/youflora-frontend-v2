'use client'
import { useSettings } from '@/providers/SettingsProvider'
export default function AdminCashback(){
  const { globalCashbackPercent, set } = useSettings()
  return (
    <div className="space-y-4">
      <div className="text-xl font-semibold">Глобальный кэшбек</div>
      <div className="card p-4 flex items-center gap-3">
        <label>Процент кэшбека для всех товаров</label>
        <input type="number" className="input w-28" value={globalCashbackPercent} onChange={e=>set({ globalCashbackPercent: Number(e.target.value) })} /><span>%</span>
      </div>
      <div className="text-sm text-gray-600">По ТЗ: кэшбек задается глобально администратором (в %) и не влияет на комиссию маркетплейса; продавец может задавать кэшбек в рублях по своим товарам.</div>
    </div>
  )
}
