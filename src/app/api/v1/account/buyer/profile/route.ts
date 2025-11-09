import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const buyer = await prisma.buyer.findFirst({ where: { email: 'buyer@demo.local' } })
  return NextResponse.json({ profile: buyer })
}

export async function PUT(req: Request) {
  const body = await req.json().catch(()=>({}))
  const { name, companyName, phone, avatarUrl, logoUrl } = body
  const buyer = await prisma.buyer.upsert({
    where: { email: 'buyer@demo.local' },
    update: { name, companyName, phone, avatarUrl, logoUrl },
    create: { email: 'buyer@demo.local', name, companyName, phone, avatarUrl, logoUrl }
  })
  return NextResponse.json({ ok: true, profile: buyer })
}
