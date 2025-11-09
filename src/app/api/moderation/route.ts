// src/app/api/v1/moderations/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ModerationStatus, ModerationType } from '@prisma/client'

function bad(msg: string, code = 400) {
  return NextResponse.json({ error: msg }, { status: code })
}

// GET /api/v1/moderations?status=PENDING|APPROVED|REJECTED|ALL
export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const statusRaw = (url.searchParams.get('status') || 'PENDING').toUpperCase()

    const where =
      statusRaw === 'ALL'
        ? {}
        : { status: (statusRaw as keyof typeof ModerationStatus) as ModerationStatus }

    const list = await prisma.moderation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        seller: { select: { id: true, name: true } },
        product: {
          select: {
            id: true,
            name: true,
            sku: true,
            categoryId: true,
            pricePerBoxSeller: true,
            stemsPerBox: true,
            cutLengthCm: true,
            color: true,
            country: true,
            photos: true,
            stockStatus: true,
            published: true,
          },
        },
      },
    })

    const items = list.map((m) => {
      // Берём видимые поля из draft (если NEW_PRODUCT или правки), иначе из original/product
      const draft = (m.draft as any) || {}
      const original = (m.original as any) || {}
      const ui = {
        id: m.id,
        type: m.type,
        status: m.status,
        createdAt: m.createdAt,
        approvedAt: m.approvedAt,
        seller: { id: m.sellerId, name: m.seller?.name ?? '' },
        productId: m.productId ?? null,
        // Для карточки в админке: заголовок и несколько ключевых полей
        name: draft.name ?? original.name ?? m.product?.name ?? '(без названия)',
        sku: draft.sku ?? original.sku ?? m.product?.sku ?? '',
        pricePerBoxSeller:
          draft.pricePerBoxSeller ?? original.pricePerBoxSeller ?? m.product?.pricePerBoxSeller ?? null,
        stemsPerBox: draft.stemsPerBox ?? original.stemsPerBox ?? m.product?.stemsPerBox ?? null,
        cutLengthCm: draft.cutLengthCm ?? original.cutLengthCm ?? m.product?.cutLengthCm ?? null,
        color: draft.color ?? original.color ?? m.product?.color ?? '',
        photos: draft.photos ?? original.photos ?? m.product?.photos ?? [],
        fieldsChanged: m.fieldsChanged ?? [],
        rejectReason: m.rejectReason ?? null,
      }
      return ui
    })

    return NextResponse.json({ items })
  } catch (e) {
    console.error('GET /api/v1/moderations failed:', e)
    return bad('Internal error', 500)
  }
}

// POST /api/v1/moderations
// ожидает как минимум: { type:'NEW_PRODUCT'|'EDIT_PRODUCT', sellerId, draft, productId? }
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const type = String(body?.type || '').toUpperCase() as ModerationType
    const sellerId = String(body?.sellerId || '')
    const productId = body?.productId ? String(body.productId) : undefined
    const draft = body?.draft

    if (!sellerId) return bad('sellerId is required')
    if (!type || !['NEW_PRODUCT', 'EDIT_PRODUCT'].includes(type)) return bad('type is invalid')
    if (type === 'EDIT_PRODUCT' && !productId) return bad('productId is required for EDIT_PRODUCT')
    if (!draft || typeof draft !== 'object') return bad('draft is required')

    const fieldsChanged = Object.keys(draft)

    const created = await prisma.moderation.create({
      data: {
        type,
        status: ModerationStatus.PENDING,
        sellerId,
        productId,
        draft,
        original: null,
        fieldsChanged,
      },
      select: { id: true },
    })

    return NextResponse.json({ ok: true, id: created.id }, { status: 201 })
  } catch (e) {
    console.error('POST /api/v1/moderations failed:', e)
    return bad('Internal error', 500)
  }
}
