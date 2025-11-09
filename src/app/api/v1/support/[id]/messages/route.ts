// GET, POST /api/v1/support/:id/messages
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const rows = await prisma.supportMessage.findMany({
    where: { ticketId: params.id },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json({ items: rows });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { body, actor = 'SELLER', authorId } = await req.json();
    if (!body) return NextResponse.json({ error: 'body обязателен' }, { status: 400 });

    // Сообщение
    const msg = await prisma.supportMessage.create({
      data: {
        ticketId: params.id,
        body,
        authorRole: actor,
        authorId: authorId ?? null,
      },
    });

    // Обновим статус тикета (ожидаем администратора)
    await prisma.supportTicket.update({
      where: { id: params.id },
      data: {
        status: actor === 'SELLER' || actor === 'CUSTOMER' ? 'NEW' : 'IN_PROGRESS',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(msg, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Post failed' }, { status: 500 });
  }
}
