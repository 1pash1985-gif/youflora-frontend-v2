import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  const items = await prisma.banner.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] })
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const created = await prisma.banner.create({
      data: {
        title: String(body.title || ""),
        subtitle: String(body.subtitle || ""),
        imageUrl: String(body.imageUrl || ""),
        linkUrl: String(body.linkUrl || ""),
        isActive: body.isActive ?? true,
        sortOrder: Number.isFinite(+body.sortOrder) ? +body.sortOrder : 0,
      },
    })
    return NextResponse.json({ ok: true, item: created })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "create failed" }, { status: 400 })
  }
}
