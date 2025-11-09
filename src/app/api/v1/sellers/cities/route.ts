import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const sellerId = searchParams.get('sellerId') || undefined

    const items = await prisma.city.findMany({
      where: sellerId ? { sellerId } : undefined,
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ items })
  } catch (e) {
    console.error('GET /seller/cities', e)
    return NextResponse.json({ error: 'failed' }, { status: 500 })
  }
}
