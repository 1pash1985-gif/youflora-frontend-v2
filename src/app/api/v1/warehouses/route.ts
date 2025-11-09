import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const sellerId = searchParams.get('sellerId') ?? 's-ec'
  const data = await prisma.warehouse.findMany({
    where: { sellerId },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(data)
}
