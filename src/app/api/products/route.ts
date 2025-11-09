import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const list = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(list.map(p => ({
    ...p,
    photos: (p.photos as any) ?? [],
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  })))
}
