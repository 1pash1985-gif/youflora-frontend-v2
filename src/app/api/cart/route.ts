import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export async function GET(req: NextRequest) {
  const buyerId = req.nextUrl.searchParams.get('buyerId') || 'b-demo'
  const cart = await prisma.cart.findFirst({ where: { buyerId }, include: { items: { include: { product: true } } } })
  return NextResponse.json(cart || { id: null, buyerId, items: [] })
}
export async function POST(req: NextRequest) {
  const b = await req.json()
  const cart = await prisma.cart.upsert({ where: { buyerId: b.buyerId }, create: { buyerId: b.buyerId }, update: {} })
  const item = await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId: b.productId } },
    create: { cartId: cart.id, productId: b.productId, qty: Number(b.qty) || 1 },
    update: { qty: { increment: Number(b.qty) || 1 } }
  })
  return NextResponse.json({ ok: true, itemId: item.id })
}
export async function DELETE(req: NextRequest) {
  const buyerId = req.nextUrl.searchParams.get('buyerId') || 'b-demo'
  const cart = await prisma.cart.findFirst({ where: { buyerId } })
  if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } })
  return NextResponse.json({ ok: true })
}
