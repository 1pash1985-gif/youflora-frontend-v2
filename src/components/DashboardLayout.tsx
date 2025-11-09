'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

export function DashboardLayout({ title, menu, children }:{ title:string, menu: {href:string; label:string}[], children:React.ReactNode }) {
  const pathname = usePathname()
  return (
    <div className="grid grid-cols-12 gap-6">
      <aside className="col-span-12 md:col-span-3">
        <div className="card p-4 sticky top-20">
          <div className="font-semibold mb-3">{title}</div>
          <nav className="grid gap-1">
            {menu.map(m => (
              <Link key={m.href} href={m.href} className={clsx('px-3 py-2 rounded-lg hover:bg-gray-50', pathname === m.href && 'bg-blue-50 text-ozon-blue font-medium')}>
                {m.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
      <section className="col-span-12 md:col-span-9">
        {children}
      </section>
    </div>
  )
}
