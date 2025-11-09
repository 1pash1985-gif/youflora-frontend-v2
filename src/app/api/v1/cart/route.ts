import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function requireBuyer(req: Request) {
  const buyerId = req.headers.get('x-buyer-id') || 'buyer-demo'
  return buyerId
}

export async function GET(req: Request) {
  const buyerId = requireBuyer(req)
  const cart = await prisma.cart.upsert({
    where: { buyerId },
    create: { buyerId },
    update: {},
  })
  const items = await prisma.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: true, seller: true },
  })
  // сгруппируем по продавцам
  const groups: Record<string, any> = {}
  items.forEach((it) => {
    const key = it.sellerId
    if (!groups[key]) groups[key] = { sellerId: key, items: [], sum: 0 }
    groups[key].items.push(it)
    groups[key].sum += it.qtyBoxes * it.priceRub
  })
  return NextResponse.json({ cartId: cart.id, groups: Object.values(groups) })
}

export async function POST(req: Request) {
  const buyerId = requireBuyer(req)
  const { productId, qtyBoxes } = await req.json()
  const product = await prisma.product.findUnique({ where: { id: productId } })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  const cart = await prisma.cart.upsert({ where: { buyerId }, create: { buyerId }, update: {} })
  // если уже есть — обновим
  const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId } })
  if (existing) {
    const upd = await prisma.cartItem.update({
      where: { id: existing.id },
      data: { qtyBoxes: Number(qtyBoxes || 0) },
    })
    return NextResponse.json(upd)
  } else {
    const row = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        sellerId: product.sellerId,
        qtyBoxes: Number(qtyBoxes || 0),
        priceRub: product.pricePerBoxSeller,
      },
    })
    return NextResponse.json(row, { status: 201 })
  }
}

export async function DELETE(req: Request) {
  const buyerId = requireBuyer(req)
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
  await prisma.cartItem.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
