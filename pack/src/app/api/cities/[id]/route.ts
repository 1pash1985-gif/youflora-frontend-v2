import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const whs = await prisma.warehouse.findMany({ where: { cityId: params.id } })
  const whIds = whs.map(w => w.id)
  await prisma.stock.deleteMany({ where: { warehouseId: { in: whIds } } })
  await prisma.warehouse.deleteMany({ where: { id: { in: whIds } } })
  await prisma.city.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
