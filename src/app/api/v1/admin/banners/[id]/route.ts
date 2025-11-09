import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PATCH(_: Request, { params }: { params: { id: string } }) {
  const body = await _.json().catch(() => ({}))
  const updated = await prisma.banner.update({ where: { id: params.id }, data: body })
  return NextResponse.json({ ok: true, id: updated.id })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await prisma.banner.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
