import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
