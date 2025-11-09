import { NextRequest, NextResponse } from 'next/server'
import { previewCart } from '@/lib/orders.server'
export async function POST(req: NextRequest) {
  const b = await req.json()
  const data = await previewCart(b.buyerId || 'b-demo', b.spendBySeller || {})
  return NextResponse.json(data)
}
