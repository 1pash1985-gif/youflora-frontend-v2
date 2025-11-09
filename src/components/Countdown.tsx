'use client'
import { useEffect, useState } from 'react'
export function Countdown({ deadlineIso, onElapsed }: { deadlineIso: string; onElapsed?: () => void }) {
  const [left, setLeft] = useState<number>(() => new Date(deadlineIso).getTime() - Date.now())
  useEffect(() => {
    const t = setInterval(() => {
      const ms = new Date(deadlineIso).getTime() - Date.now()
      setLeft(ms)
      if (ms <= 0) { clearInterval(t); onElapsed?.() }
    }, 1000)
    return () => clearInterval(t)
  }, [deadlineIso, onElapsed])
  if (left <= 0) return <span>00:00:00</span>
  const h = Math.floor(left / 3600000), m = Math.floor((left % 3600000) / 60000), s = Math.floor((left % 60000) / 1000)
  const pad = (x: number) => x.toString().padStart(2, '0')
  return <span>{pad(h)}:{pad(m)}:{pad(s)}</span>
}
