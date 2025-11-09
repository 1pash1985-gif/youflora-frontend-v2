import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.stock.deleteMany({ where: { warehouseId: params.id } })
  await prisma.warehouse.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
