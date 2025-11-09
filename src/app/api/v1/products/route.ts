import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const sellerId = searchParams.get('sellerId') ?? undefined
    const onlyPublished = searchParams.get('published') !== 'false'

    const items = await prisma.product.findMany({
      where: {
        ...(sellerId ? { sellerId } : {}),
        ...(onlyPublished ? { published: true } : {}),
      },
      orderBy: [{ createdAt: 'desc' }],
    })

    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))

    const sellerId = String(body?.sellerId || '').trim()
    const categoryId = String(body?.categoryId || '').trim()
    const name = String(body?.name || '').trim()
    const description = body?.description ? String(body.description) : null
    const cutLengthCm = Number.isFinite(Number(body?.cutLengthCm))
      ? Number(body.cutLengthCm)
      : 0

    // UI убран SKU, а в схеме он обязателен → генерируем
    const sku: string = String(
      body?.sku ?? `SKU-${Date.now().toString(36).toUpperCase()}`
    )

    const pricePerBoxSeller = Number.isFinite(Number(body?.pricePerBoxSeller))
      ? Number(body.pricePerBoxSeller)
      : 0
    const stemsPerBox = Number.isFinite(Number(body?.stemsPerBox))
      ? Number(body.stemsPerBox)
      : 0

    const color = body?.color ? String(body.color) : null
    const country = body?.country ? String(body.country) : null

    const photosArray: string[] = Array.isArray(body?.photos)
      ? body.photos.filter(Boolean).map((x: any) => String(x))
      : []

    if (!sellerId) {
      return NextResponse.json({ error: 'sellerId is required' }, { status: 400 })
    }
    if (!categoryId) {
      return NextResponse.json({ error: 'categoryId is required' }, { status: 400 })
    }
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    // Создаём товар НЕ публикуя
    const product = await prisma.product.create({
      data: {
        sellerId,
        categoryId,
        name,
        sku,
        description: description || undefined,
        pricePerBoxSeller,
        stemsPerBox,
        cutLengthCm,
        color: color || undefined,
        country: country || undefined,
        photos: photosArray,
        stockStatus: 'AVAILABLE',
        sellerDiscountRub: 0,
        sellerCashbackRub: 0,
        published: false, // в модерации пока скрыт
      },
    })

    // Авто‑модерация (чтобы UI, который вызывает /moderations отдельно, тоже был совместим)
    const draftForModeration = {
      sellerId,
      categoryId,
      name,
      description,
      pricePerBoxSeller,
      stemsPerBox,
      cutLengthCm,
      color,
      country,
      photos: photosArray,
    }

    // если уже есть незавершенная модерация по этому товару — не дублируем
    const existing = await prisma.moderation.findFirst({
      where: { productId: product.id, status: 'PENDING' },
      select: { id: true },
    })
    const moderation =
      existing ??
      (await prisma.moderation.create({
        data: {
          type: 'NEW_PRODUCT',
          status: 'PENDING',
          sellerId,
          productId: product.id,
          draft: draftForModeration,
          fieldsChanged: Object.keys(draftForModeration),
        },
        select: { id: true },
      }))

    return NextResponse.json(
      { product, moderationId: moderation.id },
      { status: 201 }
    )
  } catch (e: any) {
    console.error('POST /products failed:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
