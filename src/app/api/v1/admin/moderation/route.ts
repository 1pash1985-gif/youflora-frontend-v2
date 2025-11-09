// src/app/api/v1/admin/moderation/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const statusQ = (url.searchParams.get('status') || 'PENDING').toUpperCase();
    const where =
      statusQ === 'ALL'
        ? {}
        : { status: statusQ as 'PENDING' | 'APPROVED' | 'REJECTED' };

    const items = await prisma.moderation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ items });
  } catch (e) {
    console.error('GET /admin/moderation error', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
