import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const it = await prisma.moderation.findUnique({ where: { id: params.id } })
  if (!it || it.status !== 'PENDING') return NextResponse.json({ ok: false, error: 'Not found or processed' }, { status: 400 })

  if (it.type === 'NEW_PRODUCT') {
    const d: any = it.draftJson || {}
    const prod = await prisma.product.create({
      data: {
        sellerId: it.sellerId,
        categoryId: d.categoryId,
        name: d.name, sku: d.sku,
        description: d.description ?? null,
        photos: Array.isArray(d.photos) && d.photos.length ? d.photos : ['/images/placeholder.png'],
        stemsPerBox: d.stemsPerBox ?? null,
        pricePerBoxSeller: d.pricePerBoxSeller ?? 0,
        sellerDiscountRub: d.sellerDiscountRub ?? 0,
        sellerCashbackRub: d.sellerCashbackRub ?? 0,
        cutLengthCm: d.cutLengthCm ?? null,
        color: d.color ?? null,
        country: d.country ?? null,
      }
    })
    await prisma.moderation.update({ where: { id: it.id }, data: { status: 'APPROVED', approvedAt: new Date(), productId: prod.id } })
    return NextResponse.json({ ok: true, productId: prod.id })
  } else {
    if (!it.productId) return NextResponse.json({ ok: false, error: 'productId missing' }, { status: 400 })
    const d: any = it.draftJson || {}
    const fields: string[] = Array.isArray(it.fieldsChanged) ? (it.fieldsChanged as any) : []
    const data: any = {}
    fields.forEach((f) => { data[f] = d[f] })
    if (data.photos && (!Array.isArray(data.photos) || data.photos.length === 0)) delete data.photos
    await prisma.product.update({ where: { id: it.productId }, data })
    await prisma.moderation.update({ where: { id: it.id }, data: { status: 'APPROVED', approvedAt: new Date() } })
    return NextResponse.json({ ok: true, productId: it.productId })
  }
}
