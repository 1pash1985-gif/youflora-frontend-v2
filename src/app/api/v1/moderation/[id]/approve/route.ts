import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  await prisma.moderation.update({ where: { id: params.id }, data: { status: 'APPROVED', approvedAt: new Date() } })
  return NextResponse.json({ ok: true })
}
