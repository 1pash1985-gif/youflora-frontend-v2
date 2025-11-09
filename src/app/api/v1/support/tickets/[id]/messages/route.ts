// GET  /api/v1/support/tickets/:id/messages
// POST /api/v1/support/tickets/:id/messages { authorKind: 'SELLER'|'ADMIN', text }
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, SupportAuthorKind } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const messages = await prisma.supportMessage.findMany({
      where: { ticketId: params.id },
      orderBy: { createdAt: 'asc' },
    })
    return NextResponse.json({ items: messages })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { authorKind, text } = await req.json()
    if (!text) return NextResponse.json({ error: 'text required' }, { status: 400 })

    const kind: SupportAuthorKind =
      authorKind === 'ADMIN' ? 'ADMIN' : authorKind === 'BUYER' ? 'BUYER' : 'SELLER'

    const msg = await prisma.supportMessage.create({
      data: { ticketId: params.id, authorKind: kind, text },
    })

    // апдейтим updatedAt тикета, чтобы он поднимался вверх
    await prisma.supportTicket.update({ where: { id: params.id }, data: { updatedAt: new Date() } })

    return NextResponse.json(msg, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to post message' }, { status: 500 })
  }
}
