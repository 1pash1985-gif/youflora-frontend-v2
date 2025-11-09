import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(req: Request) {
  const { fromId, toId, productId, qtyBoxes } = await req.json()
  const qty = Number(qtyBoxes || 0)
  if (qty <= 0) return NextResponse.json({ error: 'qtyBoxes must be > 0' }, { status: 400 })

  // транзакция
  const result = await prisma.$transaction(async (tx) => {
    const from = await tx.stock.findUnique({
      where: { warehouseId_productId: { warehouseId: fromId, productId } },
    })
    const left = (from?.qtyBoxes || 0) - qty
    if (left < 0) throw new Error('Not enough stock')
    await tx.stock.upsert({
      where: { warehouseId_productId: { warehouseId: fromId, productId } },
      create: { warehouseId: fromId, productId, qtyBoxes: 0 },
      update: { qtyBoxes: left },
    })
    const to = await tx.stock.findUnique({
      where: { warehouseId_productId: { warehouseId: toId, productId } },
    })
    await tx.stock.upsert({
      where: { warehouseId_productId: { warehouseId: toId, productId } },
      create: { warehouseId: toId, productId, qtyBoxes: qty },
      update: { qtyBoxes: (to?.qtyBoxes || 0) + qty },
    })
  })
  return NextResponse.json({ ok: true })
}
