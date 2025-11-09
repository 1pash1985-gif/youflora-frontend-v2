import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export async function GET() {
  const q = await prisma.moderation.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(q.map(it => ({
    id: it.id, type: it.type, status: it.status,
    sellerId: it.sellerId, productId: it.productId ?? undefined,
    createdAt: it.createdAt.toISOString(),
    approvedAt: it.approvedAt ? it.approvedAt.toISOString() : undefined,
    draft: it.draftJson as any, original: it.originalJson as any,
    fieldsChanged: (it.fieldsChanged as any) ?? [],
    rejectReason: it.rejectReason ?? undefined,
  })))
}
export async function POST(req: NextRequest) {
  const body = await req.json()
  const created = await prisma.moderation.create({
    data: {
      type: body.type, sellerId: body.sellerId,
      productId: body.productId ?? null,
      draftJson: body.draft ?? null,
      originalJson: body.original ?? null,
      fieldsChanged: body.fieldsChanged ?? null,
    }
  })
  return NextResponse.json({ ok: true, id: created.id })
}
