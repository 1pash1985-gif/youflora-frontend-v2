# scripts\apply_youflora_patch.ps1
param([switch]$DryRun)

$ErrorActionPreference = 'Stop'

function Ensure-Dir($Path) {
  if (-not (Test-Path $Path)) { New-Item -ItemType Directory -Force -Path $Path | Out-Null }
}

function Write-Text($Path, [string]$Content) {
  $Dir = Split-Path $Path -Parent
  Ensure-Dir $Dir
  if ($DryRun) { Write-Host "-> would write $Path"; return }
  $Content | Set-Content -Encoding UTF8 -Path $Path
  Write-Host "✔ Wrote $Path"
}

# --- 1) prisma helper ---------------------------------------------------------
Write-Text 'src\lib\prisma.ts' @'
import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

export const prisma: PrismaClient =
  (global as any).__prisma ?? new PrismaClient({ log: ['error', 'warn'] })

if (process.env.NODE_ENV !== 'production') (global as any).__prisma = prisma

export default prisma
'@

# --- 2) layout: убираем ./layout.css, чиним Header ---------------------------
Write-Text 'src\app\layout.tsx' @'
import type { Metadata } from "next"
import "./globals.css"
import Header from "@/components/Header"

export const metadata: Metadata = {
  title: "YouFlora B2B",
  description: "Маркетплейс цветов для юрлиц: от 1 коробки",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Header />
        <main className="container-app py-6">{children}</main>
      </body>
    </html>
  )
}
'@

# Если нет globals.css — создадим минимальный
if (-not (Test-Path 'src\app\globals.css')) {
  Write-Text 'src\app\globals.css' @'
:root { --border: #e5e7eb; }
html, body { margin:0; padding:0; }
.container-app { max-width: 1120px; margin: 0 auto; padding: 0 1rem; }
.input { border:1px solid var(--border); border-radius: .5rem; padding:.5rem .75rem; }
.btn { border:1px solid var(--border); border-radius:.5rem; padding:.5rem .9rem; }
.btn-primary { background:#111827; color:#fff; }
.btn-danger { background:#ef4444; color:#fff; }
'@
}

# --- 3) Header: меню "Регистрация" ------------------------------------------
Write-Text 'src\components/Header.tsx' @'
"use client"

import Link from "next/link"
import { useState } from "react"

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link className="font-semibold" href="/">YouFlora</Link>

        <nav className="flex items-center gap-3 text-sm">
          <Link href="/catalog">Каталог</Link>
          <div className="relative">
            <button
              type="button"
              className="inline-flex items-center gap-1"
              onClick={() => setOpen(v => !v)}
            >
              Регистрация
              <svg width="12" height="12" viewBox="0 0 20 20"><path d="M5 7l5 6 5-6H5z" /></svg>
            </button>
            {open && (
              <div className="absolute mt-2 w-56 rounded border bg-white shadow">
                <Link className="block px-3 py-2 hover:bg-gray-50" href="/register?role=buyer" onClick={() => setOpen(false)}>
                  Стать покупателем
                </Link>
                <Link className="block px-3 py-2 hover:bg-gray-50" href="/register?role=seller" onClick={() => setOpen(false)}>
                  Стать продавцом
                </Link>
              </div>
            )}
          </div>
          <Link href="/cart">Корзина</Link>
          {/* <Link href="/admin">Админка</Link> */}
        </nav>

        <div className="ml-auto w-[280px]">
          <input className="input w-full" placeholder="Поиск по каталогу…" />
        </div>
      </div>
    </header>
  )
}
'@

# --- 4) Главная: баннеры -----------------------------------------------------
Write-Text 'src\components\BannerCarousel.tsx' @'
import prisma from "@/lib/prisma"

export default async function BannerCarousel() {
  try {
    const banners = await prisma.banner.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    })
    if (!banners?.length) return null

    return (
      <div className="relative overflow-hidden rounded-lg border">
        <div className="flex gap-3 p-3 overflow-auto">
          {banners.map((b) => (
            <a key={b.id} href={b.linkUrl || "#"} className="block min-w-[280px] md:min-w-[420px]" title={b.title || ""}>
              <img src={b.imageUrl || "/placeholder-banner.jpg"} alt={b.title || "banner"} className="w-full h-48 object-cover rounded" />
              {(b.title || b.subtitle) && (
                <div className="mt-2">
                  {b.title && <div className="font-medium">{b.title}</div>}
                  {b.subtitle && <div className="text-sm text-gray-500">{b.subtitle}</div>}
                </div>
              )}
            </a>
          ))}
        </div>
      </div>
    )
  } catch {
    return null
  }
}
'@

Write-Text 'src\app\page.tsx' @'
import BannerCarousel from "@/components/BannerCarousel"

export default async function HomePage() {
  return (
    <div className="p-6 space-y-8">
      <BannerCarousel />
      {/* здесь ваши секции каталога */}
    </div>
  )
}
'@

# --- 5) Upload API: сохраняет в public/uploads/banners -----------------------
Ensure-Dir 'public\uploads\banners'
Write-Text 'src\app\api\upload\route.ts' @'
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
'@

# --- 6) Баннеры: админ API + страница ----------------------------------------
Write-Text 'src\app\api\v1\admin\banners\route.ts' @'
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
'@

Ensure-Dir 'src\app\api\v1\admin\banners\[id]'
Write-Text 'src\app\api\v1\admin\banners\[id]\route.ts' @'
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

type Params = { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json()
    const updated = await prisma.banner.update({
      where: { id: params.id },
      data: {
        title: body.title,
        subtitle: body.subtitle,
        imageUrl: body.imageUrl,
        linkUrl: body.linkUrl,
        isActive: body.isActive,
        sortOrder: Number.isFinite(+body.sortOrder) ? +body.sortOrder : undefined,
      },
    })
    return NextResponse.json({ ok: true, item: updated })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "update failed" }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await prisma.banner.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "delete failed" }, { status: 400 })
  }
}
'@

Write-Text 'src\app\admin\banners\page.tsx' @'
"use client"

import { useEffect, useState } from "react"

type Banner = {
  id: string
  title: string | null
  subtitle: string | null
  imageUrl: string
  linkUrl: string | null
  isActive: boolean
  sortOrder: number
}

export default function AdminBannersPage() {
  const [items, setItems] = useState<Banner[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setError(null); setLoading(true)
    try {
      const res = await fetch("/api/v1/admin/banners", { cache: "no-store" })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || `HTTP ${res.status}`)
      setItems(j.items || [])
    } catch (e: any) {
      setError(e?.message || "Не удалось загрузить баннеры")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function upload(file: File) {
    const fd = new FormData()
    fd.append("file", file)
    const res = await fetch("/api/upload", { method: "POST", body: fd })
    const j = await res.json()
    if (!res.ok) throw new Error(j?.error || `HTTP ${res.status}`)
    return j.url as string
  }

  async function addBanner(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setError(null)
    const f = e.currentTarget
    const title = (f.elements.namedItem("title") as HTMLInputElement)?.value
    const linkUrl = (f.elements.namedItem("linkUrl") as HTMLInputElement)?.value
    const sortOrder = Number((f.elements.namedItem("sortOrder") as HTMLInputElement)?.value || 0)
    const fileInput = f.elements.namedItem("image") as HTMLInputElement
    if (!fileInput?.files?.[0]) { setError("Выберите файл баннера"); return }
    try {
      const imageUrl = await upload(fileInput.files[0])
      const res = await fetch("/api/v1/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, linkUrl, sortOrder, imageUrl, isActive: true }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || `HTTP ${res.status}`)
      f.reset(); await load()
    } catch (e: any) { setError(e?.message || "Не удалось добавить баннер") }
  }

  async function updateBanner(id: string, patch: Partial<Banner>) {
    const res = await fetch(`/api/v1/admin/banners/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
    const j = await res.json()
    if (!res.ok) throw new Error(j?.error || `HTTP ${res.status}`)
    await load()
  }

  async function removeBanner(id: string) {
    if (!confirm("Удалить баннер?")) return
    const res = await fetch(`/api/v1/admin/banners/${id}`, { method: "DELETE" })
    const j = await res.json()
    if (!res.ok) throw new Error(j?.error || `HTTP ${res.status}`)
    await load()
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold">Баннеры</h1>

      <form onSubmit={addBanner} className="grid gap-3 md:grid-cols-2 p-4 border rounded">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Заголовок</label>
          <input name="title" className="input w-full" placeholder="Например: Свежие розы" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Ссылка</label>
          <input name="linkUrl" className="input w-full" placeholder="/" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Порядок</label>
          <input name="sortOrder" type="number" defaultValue={0} className="input w-full" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Изображение</label>
          <input name="image" type="file" accept="image/*" className="input w-full" />
        </div>
        <div className="md:col-span-2">
          <button className="btn btn-primary">Добавить баннер</button>
          {error && <span className="ml-3 text-red-600">{error}</span>}
        </div>
      </form>

      <div className="grid gap-4">
        {loading && <div>Загрузка…</div>}
        {!loading && items.map((b) => (
          <div key={b.id} className="flex items-center gap-4 p-3 border rounded">
            <img src={b.imageUrl} alt="" className="w-40 h-20 object-cover rounded" />
            <div className="min-w-0">
              <div className="font-medium">{b.title}</div>
              <div className="text-sm text-gray-500">{b.linkUrl}</div>
            </div>
            <label className="ml-auto flex items-center gap-2">
              <input type="checkbox" checked={b.isActive} onChange={(e) => updateBanner(b.id, { isActive: e.target.checked })} />
              Активен
            </label>
            <input type="number" className="input w-24" defaultValue={b.sortOrder}
              onBlur={(e) => updateBanner(b.id, { sortOrder: Number(e.target.value || 0) })} title="Порядок" />
            <button className="btn btn-danger" onClick={() => removeBanner(b.id)}>Удалить</button>
          </div>
        ))}
        {!loading && !items.length && <div className="text-gray-500">Баннеров пока нет</div>}
      </div>
    </div>
  )
}
'@

# --- 7) Тикеты: API (GET/POST) + админ‑фильтр -------------------------------
Write-Text 'src\app\api\v1\support\tickets\route.ts' @'
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const requesterId = url.searchParams.get("requesterId") || undefined
  const requesterRole = url.searchParams.get("requesterRole") || undefined

  const where: any = {}
  if (requesterId) where.requesterId = requesterId
  if (requesterRole) where.requesterRole = requesterRole

  const items = await prisma.supportTicket.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
    include: { messages: { orderBy: { createdAt: "asc" } } },
  })

  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const requesterId = String(body?.requesterId || "").trim()
    const requesterRole = (body?.requesterRole || "SELLER") as "SELLER" | "BUYER" | "ADMIN" | "MODERATOR"
    const subject = String(body?.subject || "").trim()
    const message = String(body?.message || "").trim()
    const topic = String(body?.topic || subject || "GENERAL")

    if (!requesterId) return NextResponse.json({ error: "requesterId is required" }, { status: 400 })
    if (!subject) return NextResponse.json({ error: "subject is required" }, { status: 400 })
    if (!message) return NextResponse.json({ error: "message is required" }, { status: 400 })

    const created = await prisma.supportTicket.create({
      data: {
        requesterId,
        requesterRole,
        subject,
        topic,
        status: "NEW",
        messages: { create: { authorId: requesterId, authorRole: requesterRole, text: message } },
      },
      include: { messages: true },
    })

    return NextResponse.json({ ok: true, item: created })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Internal error" }, { status: 500 })
  }
}
'@

Write-Text 'src\app\api\v1\admin\support\route.ts' @'
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const status = (url.searchParams.get("status") || "ALL").toUpperCase()
  const role = url.searchParams.get("role")?.toUpperCase() // SELLER | BUYER | undefined

  const where: any = {}
  if (status !== "ALL") where.status = status
  if (role) where.requesterRole = role

  const items = await prisma.supportTicket.findMany({
    where,
    orderBy: [{ updatedAt: "desc" }],
    include: { messages: { orderBy: { createdAt: "asc" } } },
  })

  return NextResponse.json({ items })
}
'@

# --- 8) Форма продавца: тикет с requesterId ---------------------------------
Write-Text 'src\app\seller\support\new\page.tsx' @'
"use client"

import { useEffect, useState } from "react"

export default function SellerSupportNewPage() {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [requesterId, setRequesterId] = useState("s-ec")

  useEffect(() => {
    try {
      const raw = localStorage.getItem("seller_profile")
      if (raw) {
        const p = JSON.parse(raw)
        if (p?.id) setRequesterId(String(p.id))
      }
    } catch {}
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null); setOk(false)
    try {
      const res = await fetch("/api/v1/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requesterId,
          requesterRole: "SELLER",
          subject,
          message,
          topic: subject || "GENERAL",
        }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || `HTTP ${res.status}`)
      setOk(true); setSubject(""); setMessage("")
    } catch (e:any) {
      setError(e?.message || "Не удалось отправить")
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Обращение в поддержку</h1>
      <div className="rounded-lg border bg-white p-6">
        <div className="mb-4 text-sm text-gray-500">
          Отправитель (продавец): <span className="font-mono">{requesterId}</span>
        </div>
        <form onSubmit={submit} className="max-w-3xl space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Тема</label>
            <input className="input w-full" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Коротко: в чём вопрос?" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Сообщение</label>
            <textarea className="input h-48 w-full" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Опишите проблему подробнее…" />
          </div>
          <button type="submit" className="btn btn-primary">Отправить</button>
          {ok && <div className="mt-3 text-green-600">Обращение создано</div>}
          {error && <div className="mt-3 text-red-600">Не удалось отправить: {error}</div>}
        </form>
      </div>
    </div>
  )
}
'@

# --- 9) Модерации: API + админ‑страница --------------------------------------
Write-Text 'src\app\api\v1\admin\moderations\route.ts' @'
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const status = (url.searchParams.get("status") || "PENDING").toUpperCase()
  const where: any = {}
  if (status !== "ALL") where.status = status

  const items = await prisma.moderation.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ items })
}
'@

# алиас, чтобы /api/v1/moderations тоже отвечал JSON
Write-Text 'src\app\api\v1\moderations\route.ts' @'
export { GET } from "@/app/api/v1/admin/moderations/route"
'@

Ensure-Dir 'src\app\api\v1\admin\moderations\[id]\approve'
Write-Text 'src\app\api\v1\admin\moderations\[id]\approve\route.ts' @'
import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

type Params = { params: { id: string } }

export async function PATCH(_req: Request, { params }: Params) {
  try {
    const updated = await prisma.moderation.update({
      where: { id: params.id },
      data: { status: "APPROVED", approvedAt: new Date() },
    })
    return NextResponse.json({ ok: true, item: updated })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || "approve failed" }, { status: 400 })
  }
}
'@

Ensure-Dir 'src\app\api\v1\admin\moderations\[id]\reject'
Write-Text 'src\app\api\v1\admin\moderations\[id]\reject\route.ts' @'
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

type Params = { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const body = await req.json().catch(() => ({}))
    const reason = String(body?.reason || "")
    const updated = await prisma.moderation.update({
      where: { id: params.id },
      data: { status: "REJECTED", rejectReason: reason },
    })
    return NextResponse.json({ ok: true, item: updated })
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || "reject failed" }, { status: 400 })
  }
}
'@

# Простейшая админстраница модерации, работающая с API выше
Write-Text 'src\app\admin\moderation\page.tsx' @'
"use client"

import { useEffect, useState } from "react"

type Moderation = {
  id: string
  type: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  sellerId: string
  productId?: string | null
  createdAt: string
  rejectReason?: string | null
}

export default function AdminModerationPage() {
  const [items, setItems] = useState<Moderation[]>([])
  const [status, setStatus] = useState<"ALL"|"PENDING"|"APPROVED"|"REJECTED">("PENDING")
  const [error, setError] = useState<string|null>(null)

  async function load(st = status) {
    setError(null)
    const qs = new URLSearchParams({ status: st })
    const res = await fetch(`/api/v1/admin/moderations?${qs}`, { cache: "no-store" })
    const j = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(j?.error || `HTTP ${res.status}`)
    setItems(j.items || [])
  }

  useEffect(() => { load().catch(e => setError(e.message)) }, [])

  async function approve(id: string) {
    const res = await fetch(`/api/v1/admin/moderations/${id}/approve`, { method: "PATCH" })
    const j = await res.json().catch(()=> ({}))
    if (!res.ok) return alert(j?.error || `HTTP ${res.status}`)
    load().catch(()=>{})
  }

  async function reject(id: string) {
    const reason = prompt("Причина отклонения?") || ""
    const res = await fetch(`/api/v1/admin/moderations/${id}/reject`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    })
    const j = await res.json().catch(()=> ({}))
    if (!res.ok) return alert(j?.error || `HTTP ${res.status}`)
    load().catch(()=>{})
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Модерация</h1>

      <div className="flex items-center gap-2">
        {(["PENDING","APPROVED","REJECTED","ALL"] as const).map(s => (
          <button key={s}
            className={`btn ${status===s ? "btn-primary" : ""}`}
            onClick={() => { setStatus(s); load(s).catch(e=>setError(e.message)) }}>
            {s}
          </button>
        ))}
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <div className="grid gap-3">
        {items.map(m => (
          <div key={m.id} className="p-3 border rounded flex items-center gap-4">
            <div className="min-w-0">
              <div className="text-sm text-gray-500">{new Date(m.createdAt).toLocaleString()}</div>
              <div className="font-medium">{m.type} → {m.productId || "—"}</div>
              <div className="text-sm">Seller: <span className="font-mono">{m.sellerId}</span></div>
              {m.status==="REJECTED" && m.rejectReason && <div className="text-sm text-red-600">Причина: {m.rejectReason}</div>}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="px-2 py-1 rounded border text-xs">{m.status}</span>
              {m.status==="PENDING" && (
                <>
                  <button className="btn btn-primary" onClick={()=>approve(m.id)}>Одобрить</button>
                  <button className="btn btn-danger" onClick={()=>reject(m.id)}>Отклонить</button>
                </>
              )}
            </div>
          </div>
        ))}
        {!items.length && <div className="text-gray-500">Нет записей</div>}
      </div>
    </div>
  )
}
'@

Write-Host "`n=== Patch applied. Next steps ==="
Write-Host "1) npx prisma generate"
Write-Host "2) npm run dev"
Write-Host "— /admin/banners — добавить баннер (загрузка файла работает через /api/upload)"
Write-Host "— /seller/support/new — создать тикет; в админке читайте через /api/v1/admin/support?status=ALL"
Write-Host "— /admin/moderation — проверка модераций"
