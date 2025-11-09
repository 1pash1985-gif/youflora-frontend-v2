import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const rows = await prisma.supportMessage.findMany({
    where: { threadId: params.id },
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(rows)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json()
  const row = await prisma.supportMessage.create({
    data: {
      threadId: params.id,
      from: (data.from ?? 'USER') === 'ADMIN' ? 'ADMIN' : 'USER',
      text: String(data.text ?? ''),
    },
  })
  return NextResponse.json(row, { status: 201 })
}
