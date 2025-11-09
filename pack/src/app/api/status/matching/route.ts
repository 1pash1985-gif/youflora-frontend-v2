import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export async function GET(req: NextRequest) {
  const raw = (req.nextUrl.searchParams.get('statuses') || '').split(',').map(s => s.trim()).filter(Boolean)
  if (raw.length === 0) return NextResponse.json({ ids: [] })
  const stocks = await prisma.stock.findMany({ where: { status: { in: raw as any } } })
  const ids = new Set<string>()
  for (const s of stocks) {
    if (s.status === 'AVAILABLE' && s.qty <= 0) continue
    ids.add(s.productId)
  }
  return NextResponse.json({ ids: Array.from(ids) })
}
