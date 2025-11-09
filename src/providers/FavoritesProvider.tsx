'use client'
import React, { createContext, useContext, useMemo, useState } from 'react'
type Ctx = { favs:Set<string>; toggle:(id:string)=>void }
const Ctx = createContext<Ctx>({ favs:new Set(), toggle:()=>{} })
export const useFavorites = () => useContext(Ctx)
export const FavoritesProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [setData, setSetData] = useState<Set<string>>(()=>{
    if(typeof window!=='undefined'){ const raw=localStorage.getItem('favorites'); if(raw) return new Set(JSON.parse(raw))}
    return new Set()
  })
  const persist=(s:Set<string>)=>{ setSetData(new Set(s)); if(typeof window!=='undefined'){ localStorage.setItem('favorites', JSON.stringify([...s])) } }
  const toggle=(id:string)=>{ const s=new Set(setData); if(s.has(id)) s.delete(id); else s.add(id); persist(s) }
  const value = useMemo(()=>({ favs:setData, toggle }), [setData])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
