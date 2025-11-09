// src/app/api/v1/support/tickets/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { SupportTicketStatus, SupportActor } from '@prisma/client'

export const runtime = 'nodejs'

// GET ?requesterId=... — список тикетов пользователя
// GET ?status=NEW|IN_PROGRESS|CLOSED|ALL — список для админки
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const requesterId = searchParams.get('requesterId')
  const status = searchParams.get('status')

  if (requesterId) {
    const items = await prisma.supportTicket.findMany({
      where: { requesterId },
      orderBy: [{ updatedAt: 'desc' }],
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // только последнее
        },
      },
    })
    return NextResponse.json({ items })
  }

  // режим админа
  const where =
    status && status !== 'ALL'
      ? { status: status as SupportTicketStatus }
      : undefined

  const items = await prisma.supportTicket.findMany({
    where,
    orderBy: [{ updatedAt: 'desc' }],
    include: {
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })
  return NextResponse.json({ items })
}

// POST — создать тикет + первое сообщение
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const requesterId = String(body?.requesterId || '')
    const requesterRole = (body?.requesterRole || 'SELLER') as SupportActor
    const subject = String(body?.subject || '').trim()
    const message = String(body?.message || '').trim()
    // topic обязателен в вашей модели — ставим дефолт из темы
    const topic = String(body?.topic || subject || 'GENERAL')

    if (!requesterId) return NextResponse.json({ error: 'requesterId is required' }, { status: 400 })
    if (!subject) return NextResponse.json({ error: 'subject is required' }, { status: 400 })
    if (!message) return NextResponse.json({ error: 'message is required' }, { status: 400 })

    const created = await prisma.$transaction(async (tx) => {
      const ticket = await tx.supportTicket.create({
        data: {
          requesterId,
          requesterRole,
          subject,
          topic,
          status: SupportTicketStatus.NEW,
        },
      })
      await tx.supportMessage.create({
        data: {
          ticketId: ticket.id,
          authorId: requesterId,
          authorRole: requesterRole,
          text: message,
        },
      })
      return ticket
    })

    return NextResponse.json({ item: created })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}
