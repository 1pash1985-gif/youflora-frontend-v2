import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { reason } = await req.json()
  const it = await prisma.moderation.update({
    where: { id: params.id },
    data: { status: 'REJECTED', rejectReason: reason || 'Без комментария' }
  })
  return NextResponse.json({ ok: true, id: it.id })
}
