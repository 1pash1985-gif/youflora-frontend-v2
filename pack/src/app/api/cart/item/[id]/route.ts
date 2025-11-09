import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const b = await req.json()
  const it = await prisma.cartItem.update({ where: { id: params.id }, data: { qty: Number(b.qty) } })
  return NextResponse.json({ ok: true, id: it.id })
}
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.cartItem.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
