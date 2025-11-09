// src/app/api/v1/catalog/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const items = await prisma.product.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ items })
}
