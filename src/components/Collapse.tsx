'use client'
import { useEffect, useState } from 'react'

type Props = {
  title: string
  storageKey?: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export default function Collapse({ title, storageKey, defaultOpen = true, children }: Props) {
  const [open, setOpen] = useState(defaultOpen)

  useEffect(() => {
    if (!storageKey) return
    const saved = localStorage.getItem(storageKey)
    if (saved === '1') setOpen(true)
    if (saved === '0') setOpen(false)
  }, [storageKey])

  useEffect(() => {
    if (!storageKey) return
    localStorage.setItem(storageKey, open ? '1' : '0')
  }, [open, storageKey])

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={storageKey ? `collapse-${storageKey}` : undefined}
      >
        <span className="text-xl font-semibold">{title}</span>
        <span className="text-gray-500">{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div id={storageKey ? `collapse-${storageKey}` : undefined} className="border-t p-4">
          {children}
        </div>
      )}
    </div>
  )
}
