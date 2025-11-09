'use client'
import React, { createContext, useContext, useMemo, useState } from 'react'
export type Role = 'guest' | 'buyer' | 'seller' | 'admin'
type User = { id:string; name:string; email?:string; company?:string; role:Role }
type Ctx = { user:User; setRole:(r:Role)=>void; setUser:(patch:Partial<User>)=>void; logout:()=>void }
const defaultUser: User = { id: 'u-1', name: 'Гость', role: 'guest' }
const Ctx = createContext<Ctx>({ user: defaultUser, setRole:()=>{}, setUser:()=>{}, logout:()=>{} })
export const useAuth = () => useContext(Ctx)
export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUserState] = useState<User>(() => {
    if (typeof window !== 'undefined') { const raw = localStorage.getItem('auth_user'); if (raw) return JSON.parse(raw) }
    return defaultUser
  })
  const persist = (next: User) => { setUserState(next); if (typeof window !== 'undefined') localStorage.setItem('auth_user', JSON.stringify(next)) }
  const setRole = (r: Role) => persist({ ...user, role: r, name: r==='buyer'?'Покупатель': r==='seller'?'Продавец': r==='admin'?'Администратор':'Гость' })
  const setUser = (patch: Partial<User>) => persist({ ...user, ...patch })
  const logout = () => persist(defaultUser)
  const value = useMemo(() => ({ user, setRole, setUser, logout }), [user])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
