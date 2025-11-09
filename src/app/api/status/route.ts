import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get('productId')
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })
  const list = await prisma.stock.findMany({ where: { productId } })
  const flags = { AVAILABLE: false, PREORDER: false, IN_TRANSIT: false } as any
  let eta: Date | null = null
  list.forEach(s => {
    if (s.status === 'AVAILABLE' && s.qty > 0) flags.AVAILABLE = true
    if (s.status === 'PREORDER') flags.PREORDER = true
    if (s.status === 'IN_TRANSIT') { flags.IN_TRANSIT = true; if (s.eta && (!eta || s.eta < eta)) eta = s.eta }
  })
  return NextResponse.json({ flags, earliestInTransitEta: eta ? eta.toISOString() : null })
}
