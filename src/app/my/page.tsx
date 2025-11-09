'use client'
import { useAuth } from '@/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function My(){
  const { user } = useAuth()
  const router = useRouter()
  useEffect(()=>{
    if(user.role==='buyer') router.replace('/buyer')
    else if(user.role==='seller') router.replace('/seller')
    else if(user.role==='admin') router.replace('/admin')
    else router.replace('/account')
  }, [user.role, router])
  return <div className="card p-6">Переход в кабинет…</div>
}
