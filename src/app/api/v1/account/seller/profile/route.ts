import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const s = await prisma.seller.findUnique({ where: { id: 's-ec' } })
  return NextResponse.json({ profile: s })
}

export async function PUT(req: Request) {
  const body = await req.json().catch(()=>({}))
  const { name, taxId, logoUrl } = body
  const s = await prisma.seller.update({
    where: { id: 's-ec' },
    data: { name, taxId, logoUrl }
  })
  return NextResponse.json({ ok: true, profile: s })
}
