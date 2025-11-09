// GET    /api/v1/admin/support/:id
// POST   /api/v1/admin/support/:id { text }           // ответ от админа
// PATCH  /api/v1/admin/support/:id { status }         // смена статуса
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, SupportAuthorKind, SupportStatus } from '@prisma/client'
const prisma = new PrismaClient()

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })
    if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(ticket)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Admin ticket failed' }, { status: 500 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { text } = await req.json()
    if (!text) return NextResponse.json({ error: 'text required' }, { status: 400 })

    const msg = await prisma.supportMessage.create({
      data: { ticketId: params.id, authorKind: SupportAuthorKind.ADMIN, text },
    })
    await prisma.supportTicket.update({ where: { id: params.id }, data: { updatedAt: new Date() } })
    return NextResponse.json(msg, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Admin reply failed' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await req.json()
    const s = (status || '').toUpperCase()
    if (!['NEW', 'IN_PROGRESS', 'CLOSED'].includes(s)) {
      return NextResponse.json({ error: 'Bad status' }, { status: 400 })
    }
    const t = await prisma.supportTicket.update({
      where: { id: params.id },
      data: { status: s as SupportStatus },
    })
    return NextResponse.json(t)
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Status change failed' }, { status: 500 })
  }
}
