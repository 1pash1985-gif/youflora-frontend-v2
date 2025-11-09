'use client'
import { calcBuyerPricePerBox, calcBuyerPricePerStem } from '@/lib/pricing'
import type { Product } from '@/lib/types'
import { useCommission } from '@/providers/CommissionProvider'
import { useSettings } from '@/providers/SettingsProvider'

export const Price: React.FC<{ product: Product }> = ({ product }) => {
  const { commission } = useCommission()
  const { globalCashbackPercent } = useSettings()

  const perBox = calcBuyerPricePerBox(product, commission)
  const perStem = calcBuyerPricePerStem(product, commission)

  return (
    <div className="space-y-1">
      <div className="text-lg font-bold">{perBox.toLocaleString()} ₽/кор.</div>
      <div className="text-sm text-gray-500">≈ {perStem.toLocaleString()} ₽ за стебель</div>
      <div className="text-[12px] text-gray-400">Цена с учетом комиссии маркетплейса</div>
      {globalCashbackPercent > 0 && (
        <div className="text-[12px] text-green-600">Кэшбек {globalCashbackPercent}%</div>
      )}
    </div>
  )
}
