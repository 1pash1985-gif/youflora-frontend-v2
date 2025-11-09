import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(_: Request, { params }: { params: { sellerId: string } }) {
  const items = await prisma.city.findMany({ where: { sellerId: params.sellerId }, orderBy: { name: 'asc' } })
  return NextResponse.json(items)
}

export async function POST(req: Request, { params }: { params: { sellerId: string } }) {
  const { name } = await req.json()
  const city = await prisma.city.create({ data: { sellerId: params.sellerId, name } })
  return NextResponse.json(city, { status: 201 })
}
