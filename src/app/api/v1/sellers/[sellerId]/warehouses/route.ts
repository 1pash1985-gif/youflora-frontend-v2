import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: Request, { params }: { params: { sellerId: string } }) {
  const { searchParams } = new URL(req.url)
  const cityId = searchParams.get('cityId') || undefined
  const items = await prisma.warehouse.findMany({
    where: { sellerId: params.sellerId, ...(cityId && { cityId }) },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(items)
}

export async function POST(req: Request, { params }: { params: { sellerId: string } }) {
  const { name, cityId } = await req.json()
  const wh = await prisma.warehouse.create({
    data: { sellerId: params.sellerId, cityId, name },
  })
  return NextResponse.json(wh, { status: 201 })
}
