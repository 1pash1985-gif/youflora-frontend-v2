import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json()
  const updated = await prisma.product.update({
    where: { id: params.id },
    data: {
      name: data.name ?? undefined,
      sku: data.sku ?? undefined,
      description: data.description ?? undefined,
      photos: Array.isArray(data.photos) ? data.photos : undefined,
      pricePerBoxSeller: Number.isFinite(data.pricePerBoxSeller) ? data.pricePerBoxSeller : undefined,
      sellerDiscountRub: Number.isFinite(data.sellerDiscountRub) ? data.sellerDiscountRub : undefined,
      sellerCashbackRub: Number.isFinite(data.sellerCashbackRub) ? data.sellerCashbackRub : undefined,
      stemsPerBox: Number.isFinite(data.stemsPerBox) ? data.stemsPerBox : undefined,
      cutLengthCm: Number.isFinite(data.cutLengthCm) ? data.cutLengthCm : undefined,
      color: data.color ?? undefined,
      country: data.country ?? undefined,
    }
  })
  return NextResponse.json({ ok: true, id: updated.id })
}
