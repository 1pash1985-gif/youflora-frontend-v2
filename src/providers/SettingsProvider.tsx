'use client'
import React, { createContext, useContext, useMemo, useState } from 'react'

type Settings = {
  defaultConfirmTimeoutMin: number
  defaultAutoAction: 'auto_cancel' | 'auto_accept'
  globalCashbackPercent: number
  set: (patch: Partial<Settings>) => void
}
const Ctx = createContext<Settings>({
  defaultConfirmTimeoutMin: 120,
  defaultAutoAction: 'auto_cancel',
  globalCashbackPercent: 1.5,
  set: () => {},
})
export const useSettings = () => useContext(Ctx)

export const SettingsProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, setState] = useState(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('mf_settings')
      if (raw) return JSON.parse(raw)
    }
    return { defaultConfirmTimeoutMin: 120, defaultAutoAction: 'auto_cancel' as const, globalCashbackPercent: 1.5 }
  })
  const set = (patch: Partial<typeof state>) => {
    const next = { ...state, ...patch }
    setState(next)
    if (typeof window !== 'undefined') localStorage.setItem('mf_settings', JSON.stringify(next))
  }
  const value = useMemo(() => ({ ...state, set }), [state])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
