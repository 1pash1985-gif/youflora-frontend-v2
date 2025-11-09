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
