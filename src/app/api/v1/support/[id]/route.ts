// GET /api/v1/support/:id
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
    if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(ticket);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Load failed' }, { status: 500 });
  }
}
