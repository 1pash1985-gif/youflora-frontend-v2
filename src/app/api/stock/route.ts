import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export async function GET(req: NextRequest) {
  const warehouseId = req.nextUrl.searchParams.get('warehouseId') || undefined
  const productId = req.nextUrl.searchParams.get('productId') || undefined
  const list = await prisma.stock.findMany({ where: { warehouseId, productId } })
  return NextResponse.json(list)
}
export async function POST(req: NextRequest) {
  const b = await req.json()
  const eta = b.eta ? new Date(b.eta) : null
  await prisma.stock.upsert({
    where: { warehouseId_productId: { warehouseId: b.warehouseId, productId: b.productId } },
    create: { warehouseId: b.warehouseId, productId: b.productId, qty: b.qty, status: b.status, eta },
    update: { qty: b.qty, status: b.status, eta },
  })
  return NextResponse.json({ ok: true })
}
