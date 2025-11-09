import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export async function GET(req: NextRequest) {
  const sellerId = req.nextUrl.searchParams.get('sellerId') || undefined
  const cityId = req.nextUrl.searchParams.get('cityId') || undefined
  const list = await prisma.warehouse.findMany({ where: { sellerId, cityId } })
  return NextResponse.json(list)
}
export async function POST(req: NextRequest) {
  const b = await req.json()
  const w = await prisma.warehouse.create({ data: { sellerId: b.sellerId, cityId: b.cityId, name: b.name } })
  return NextResponse.json(w)
}
