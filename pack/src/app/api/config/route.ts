import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export async function GET() {
  const c = await prisma.marketplaceConfig.findUnique({ where: { id: 'main' } })
  return NextResponse.json(c)
}
export async function PATCH(req: NextRequest) {
  const b = await req.json()
  const c = await prisma.marketplaceConfig.update({
    where: { id: 'main' },
    data: {
      globalCommissionPercent: b.globalCommissionPercent ?? undefined,
      globalCashbackPercent: b.globalCashbackPercent ?? undefined,
      confirmHoldMinutes: b.confirmHoldMinutes ?? undefined,
    }
  })
  return NextResponse.json(c)
}
