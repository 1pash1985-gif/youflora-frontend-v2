import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export async function GET(req: NextRequest) {
  const sellerId = req.nextUrl.searchParams.get('sellerId') || undefined
  const list = await prisma.city.findMany({ where: { sellerId } })
  return NextResponse.json(list)
}
export async function POST(req: NextRequest) {
  const b = await req.json()
  const c = await prisma.city.create({ data: { sellerId: b.sellerId, name: b.name } })
  return NextResponse.json(c)
}
