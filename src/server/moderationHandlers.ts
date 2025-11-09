// src/server/moderationHandlers.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import type { Prisma, ModerationStatus } from '@prisma/client'

export async function listModerations(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const statusRaw = (searchParams.get('status') || '').toUpperCase()
    const sellerId = searchParams.get('sellerId') || undefined
    const take = Number(searchParams.get('take') || 50)
    const skip = Number(searchParams.get('skip') || 0)

    const where: Prisma.ModerationWhereInput = {}
    if (sellerId) where.sellerId = sellerId
    if (statusRaw && statusRaw !== 'ALL') where.status = statusRaw as ModerationStatus

    const items = await prisma.moderation.findMany({
      where,
      include: {
        product: true,
        seller: true,
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    })

    return NextResponse.json({ items })
  } catch (err: any) {
    console.error('listModerations error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

const PRODUCT_UPDATABLE_FIELDS = new Set([
  'name',
  'categoryId',
  'description',
  'pricePerBoxSeller',
  'stemsPerBox',
  'cutLengthCm',
  'color',
  'country',
  'photos',
  'stockStatus',
  'sellerDiscountRub',
  'sellerCashbackRub',
  'published',
])

function pickProductFields(draft: any) {
  if (!draft || typeof draft !== 'object') return {}
  const out: Record<string, any> = {}
  for (const k of Object.keys(draft)) {
    if (PRODUCT_UPDATABLE_FIELDS.has(k)) out[k] = draft[k]
  }
  return out
}

export async function createModeration(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const sellerId = String(body?.sellerId || '').trim()
    const type = (String(body?.type || 'NEW_PRODUCT').toUpperCase())
    const productId = body?.productId ? String(body.productId) : null
    const draft = body?.draft ?? {}
    const original = body?.original ?? null
    const fieldsChanged = Array.isArray(body?.fieldsChanged) ? body.fieldsChanged : []
    if (!sellerId) return NextResponse.json({ error: 'sellerId is required' }, { status: 400 })
    if (!['NEW_PRODUCT', 'EDIT_PRODUCT'].includes(type)) {
      return NextResponse.json({ error: 'type must be NEW_PRODUCT | EDIT_PRODUCT' }, { status: 400 })
    }

    const item = await prisma.moderation.create({
      data: {
        sellerId,
        type: type as any,
        status: 'PENDING',
        productId,
        draft,
        original,
        fieldsChanged,
      },
    })
    return NextResponse.json({ item }, { status: 201 })
  } catch (err: any) {
    console.error('createModeration error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function approveModeration(_: Request, context: { params: { id: string } }) {
  try {
    const id = context.params.id
    const mod = await prisma.moderation.findUnique({
      where: { id },
      include: { product: true },
    })
    if (!mod) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Применяем draft к товару (только белый список полей)
    if (mod.productId) {
      const patch = pickProductFields(mod.draft)
      if (Object.keys(patch).length > 0) {
        await prisma.product.update({
          where: { id: mod.productId },
          data: { ...patch, published: true },
        })
      } else {
        // хотя бы опубликуем
        await prisma.product.update({
          where: { id: mod.productId },
          data: { published: true },
        })
      }
    }

    const updated = await prisma.moderation.update({
      where: { id },
      data: { status: 'APPROVED', approvedAt: new Date(), rejectReason: null },
    })

    return NextResponse.json({ ok: true, item: updated })
  } catch (err: any) {
    console.error('approveModeration error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function rejectModeration(req: Request, context: { params: { id: string } }) {
  try {
    const id = context.params.id
    const body = await req.json().catch(() => ({}))
    const reason = String(body?.reason || '').trim() || null

    const mod = await prisma.moderation.findUnique({ where: { id } })
    if (!mod) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updated = await prisma.moderation.update({
      where: { id },
      data: { status: 'REJECTED', rejectReason: reason },
    })

    return NextResponse.json({ ok: true, item: updated })
  } catch (err: any) {
    console.error('rejectModeration error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
