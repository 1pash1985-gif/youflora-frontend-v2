// src/app/api/v1/admin/support/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Status = 'ALL' | 'NEW' | 'IN_PROGRESS' | 'CLOSED'

function bad(message: string, code = 400) {
  return NextResponse.json({ error: message }, { status: code })
}

/**
 * GET /api/v1/admin/support?status=ALL|NEW|IN_PROGRESS|CLOSED
 * Админская выборка тикетов, с последним сообщением и счётчиком
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const statusParam = (searchParams.get('status') || 'ALL').toUpperCase() as Status

    const where =
      statusParam === 'ALL' ? {} : { status: statusParam as Exclude<Status, 'ALL'> }

    const items = await prisma.supportTicket.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { messages: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    })

    return NextResponse.json({ items })
  } catch (e: any) {
    console.error('GET /admin/support failed:', e)
    return bad('Internal error', 500)
  }
}
