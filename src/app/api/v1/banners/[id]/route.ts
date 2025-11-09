// src/app/api/v1/banners/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const id = params.id
    const data: any = {}
    if ('title' in body) data.title = String(body.title)
    if ('imageUrl' in body) data.imageUrl = String(body.imageUrl)
    if ('linkUrl' in body) data.linkUrl = String(body.linkUrl || '')
    if ('isActive' in body) data.isActive = Boolean(body.isActive)
    if ('sortOrder' in body) data.sortOrder = Number.isFinite(Number(body.sortOrder)) ? Number(body.sortOrder) : 0

    const updated = await prisma.banner.update({ where: { id }, data })
    return NextResponse.json({ item: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Update failed' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.banner.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Delete failed' }, { status: 500 })
  }
}
