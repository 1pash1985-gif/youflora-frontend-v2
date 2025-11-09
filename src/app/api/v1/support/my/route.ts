// GET /api/v1/support/my?sellerId=s-ec
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId') || 's-ec';

    const rows = await prisma.supportTicket.findMany({
      where: { authorRole: 'SELLER', sellerId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { messages: true } },
      },
    });

    return NextResponse.json({ items: rows });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Load failed' }, { status: 500 });
  }
}
