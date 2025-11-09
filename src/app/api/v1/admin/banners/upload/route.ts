// src/app/api/v1/admin/banner/upload/route.ts
import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'file missing' }, { status: 400 })

  const bytes = Buffer.from(await file.arrayBuffer())
  const ext = path.extname((file as any).name || '') || '.' + (file.type?.split('/')[1] || 'png')
  const dir = path.join(process.cwd(), 'public', 'uploads', 'banners')
  await fs.mkdir(dir, { recursive: true })

  const name = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`
  const target = path.join(dir, name)
  await fs.writeFile(target, bytes)

  // Отдаём относительный URL, чтобы <img src="/uploads/banners/...">
  return NextResponse.json({ url: `/uploads/banners/${name}` })
}
