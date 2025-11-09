import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ThreadStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const all = searchParams.get('all') === '1'
  const userId = searchParams.get('userId') ?? undefined

  const where = all ? {} : { userId }
  const rows = await prisma.supportThread.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const thread = await prisma.supportThread.create({
    data: {
      userId: String(data.userId ?? 'anonymous'),
      userRole: String(data.userRole ?? 'BUYER'),
      subject: String(data.subject ?? 'Вопрос'),
      status: ThreadStatus.OPEN,
    },
  })

  if (data.message) {
    await prisma.supportMessage.create({
      data: {
        threadId: thread.id,
        from: 'USER',
        text: String(data.message),
      },
    })
  }

  return NextResponse.json(thread, { status: 201 })
}
