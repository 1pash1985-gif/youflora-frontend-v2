import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_: Request, { params }: { params: { warehouseId: string } }) {
  const rows = await prisma.stock.findMany({
    where: { warehouseId: params.warehouseId },
    include: { product: true },
  })
  return NextResponse.json(rows)
}

export async function POST(req: Request, { params }: { params: { warehouseId: string } }) {
  const { productId, qtyBoxes } = await req.json()
  const row = await prisma.stock.upsert({
    where: { warehouseId_productId: { warehouseId: params.warehouseId, productId } },
    create: { warehouseId: params.warehouseId, productId, qtyBoxes: Number(qtyBoxes || 0) },
    update: { qtyBoxes: Number(qtyBoxes || 0) },
  })
  return NextResponse.json(row)
}
