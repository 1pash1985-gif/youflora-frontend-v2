import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { reason = '' } = await req.json().catch(() => ({}))
  await prisma.moderation.update({ where: { id: params.id }, data: { status: 'REJECTED', rejectReason: reason } })
  return NextResponse.json({ ok: true })
}
