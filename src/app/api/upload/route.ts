import { NextRequest, NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"
import crypto from "crypto"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get("file") as File | null
    if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), "public", "uploads", "banners")
    await fs.mkdir(uploadDir, { recursive: true })

    const ext = (file.name?.split(".").pop() || "jpg").toLowerCase()
    const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`
    const filePath = path.join(uploadDir, name)

    await fs.writeFile(filePath, buffer)

    const url = `/uploads/banners/${name}`
    return NextResponse.json({ ok: true, path: url, url })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "upload failed" }, { status: 500 })
  }
}
