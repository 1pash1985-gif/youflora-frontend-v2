'use client'
import React, { createContext, useContext, useMemo, useState } from 'react'
import type { CommissionConfig } from '@/lib/types'

type Ctx = {
  commission: CommissionConfig
  setCommission: (updater: (prev: CommissionConfig) => CommissionConfig) => void
}
const defaultValue: CommissionConfig = {
  roundingStepRub: 1,
  globalPercent: 12,
  byCategory: {},
  bySeller: {},
  byProduct: {},
}
const CommissionCtx = createContext<Ctx>({ commission: defaultValue, setCommission: () => {} })

export const useCommission = () => useContext(CommissionCtx)

export const CommissionProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [commission, setCommissionState] = useState<CommissionConfig>(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('commission_cfg')
      if (raw) return JSON.parse(raw)
    }
    return defaultValue
  })
  const setCommission = (updater: (prev: CommissionConfig) => CommissionConfig) => {
    setCommissionState(prev => {
      const next = updater(prev)
      if (typeof window !== 'undefined') localStorage.setItem('commission_cfg', JSON.stringify(next))
      return next
    })
  }
  const value = useMemo(() => ({ commission, setCommission }), [commission])
  return <CommissionCtx.Provider value={value}>{children}</CommissionCtx.Provider>
}
