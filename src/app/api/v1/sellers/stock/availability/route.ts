import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

/**
 * GET /api/v1/seller/stock/availability?productId=...&sellerId=...
 * Возвращает суммарные остатки по городам для товара продавца.
 * Ответ: { items: Array<{ cityId, cityName, qtyBoxes }> }
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')
  if (!productId) {
    return NextResponse.json({ error: 'productId required' }, { status: 400 })
  }

  // можно передать sellerId в query; если не передали — используем демо s-ec
  const sellerId = searchParams.get('sellerId') || 's-ec'

  const warehouses = await prisma.warehouse.findMany({
    where: { sellerId },
    select: {
      id: true,
      city: { select: { id: true, name: true } },
      stocks: { where: { productId }, select: { qtyBoxes: true } },
    },
  })

  const map: Record<string, { cityId: string; cityName: string; qtyBoxes: number }> = {}
  for (const w of warehouses) {
    const cityId = w.city?.id ?? 'unknown'
    const cityName = w.city?.name ?? '—'
    const qty = w.stocks.reduce((sum, s) => sum + s.qtyBoxes, 0)
    if (!map[cityId]) map[cityId] = { cityId, cityName, qtyBoxes: 0 }
    map[cityId].qtyBoxes += qty
  }

  return NextResponse.json(
    { items: Object.values(map) },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
