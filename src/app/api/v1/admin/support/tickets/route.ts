// src/app/api/v1/admin/support/tickets/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, TicketStatus } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const status = (req.nextUrl.searchParams.get('status') || '').toUpperCase()
  const where = status && ['NEW','IN_PROGRESS','CLOSED'].includes(status)
    ? { status: status as TicketStatus }
    : {}

  const items = await prisma.supportTicket.findMany({
    where,
    orderBy: [{ status: 'asc' }, { lastMessageAt: 'desc' }],
    include: {
      _count: { select: { messages: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    }
  })
  return NextResponse.json({ items })
}

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const id = String(body.id || '')
  const status = (body.status || '').toUpperCase()
  if (!id || !['NEW','IN_PROGRESS','CLOSED'].includes(status)) {
    return NextResponse.json({ error: 'id and valid status required' }, { status: 400 })
  }
  await prisma.supportTicket.update({ where: { id }, data: { status } })
  return NextResponse.json({ ok: true })
}
