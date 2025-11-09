import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sweepExpiredOrders } from '@/lib/orders.server'

export async function GET(_: Request, { params }: { params: { id: string } }) {
  await sweepExpiredOrders()
  const o = await prisma.order.findUnique({
    where: { id: params.id },
    include: { groups: { include: { items: { include: { product: true } } } }, payment: true, buyer: true }
  })
  if (!o) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ...o, createdAt: o.createdAt.toISOString(), expiresAt: o.expiresAt.toISOString() })
}
