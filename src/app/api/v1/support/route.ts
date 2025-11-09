// POST /api/v1/support
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { subject, body, actor = 'SELLER', sellerId, authorId, contactEmail } = await req.json();

    if (!subject || !body) {
      return NextResponse.json({ error: 'subject и body обязательны' }, { status: 400 });
    }

    // В демо используем sellerId из тела, по умолчанию — 's-ec'
    const role = actor as 'SELLER' | 'CUSTOMER' | 'ADMIN';
    const ticket = await prisma.supportTicket.create({
      data: {
        subject,
        authorRole: role,
        authorId: authorId ?? null,
        sellerId: sellerId ?? 's-ec',
        contactEmail: contactEmail ?? null,
        messages: {
          create: {
            authorRole: role,
            authorId: authorId ?? null,
            body,
          },
        },
      },
    });

    return NextResponse.json(ticket, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Create failed' }, { status: 500 });
  }
}
