// src/app/api/v1/support/messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { SupportActor } from '@prisma/client'

export const runtime = 'nodejs'

// GET ?ticketId=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const ticketId = searchParams.get('ticketId') || ''
  if (!ticketId) return NextResponse.json({ error: 'ticketId is required' }, { status: 400 })

  const items = await prisma.supportMessage.findMany({
    where: { ticketId },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json({ items })
}

// POST — добавить сообщение
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const ticketId = String(body?.ticketId || '')
    const text = String(body?.text || '').trim()
    const authorId = String(body?.authorId || '')
    const authorRole = (body?.authorRole || 'SELLER') as SupportActor

    if (!ticketId || !text || !authorId) {
      return NextResponse.json({ error: 'ticketId, text, authorId are required' }, { status: 400 })
    }

    const msg = await prisma.supportMessage.create({
      data: { ticketId, text, authorId, authorRole },
    })
    // обновляем updatedAt тикета
    await prisma.supportTicket.update({ where: { id: ticketId }, data: { updatedAt: new Date() } })

    return NextResponse.json({ item: msg })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Internal error' }, { status: 500 })
  }
}
