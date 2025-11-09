import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const status = (url.searchParams.get('status') || 'PENDING') as any
  const data = await prisma.moderation.findMany({
    where: status === 'ALL' ? {} : { status },
    orderBy: { createdAt: 'desc' },
    include: { product: true, seller: true }
  })
  return NextResponse.json({ items: data })
}
