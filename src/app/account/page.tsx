'use client'

import { useEffect, useState } from 'react'

type Role = 'guest' | 'buyer' | 'seller'

export default function AccountPage() {
  const [role, setRole] = useState<Role>('guest')
  const [company, setCompany] = useState('ООО ООО')

  useEffect(() => {
    try {
      const savedRole = (localStorage.getItem('role') as Role) || 'buyer'
      const savedCompany = localStorage.getItem('company') || 'ООО ООО'
      setRole(savedRole)
      setCompany(savedCompany)
    } catch {}
  }, [])

  function become(r: Role) {
    setRole(r)
    try {
      localStorage.setItem('role', r)
    } catch {}
  }

  function logout() {
    setRole('guest')
    try {
      localStorage.removeItem('role')
    } catch {}
  }

  return (
    <div className="container-app py-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border bg-white p-6">
          <h1 className="text-2xl font-semibold mb-4">Аккаунт</h1>

          <div className="text-sm text-gray-600 mb-2">
            Текущая роль: <span className="font-semibold">{role}</span>
          </div>

          <input
            className="input w-full mb-3"
            value={role === 'buyer' ? 'Покупатель' : role === 'seller' ? 'Продавец' : 'Гость'}
            readOnly
          />

          <input
            className="input w-full mb-4"
            value={company}
            onChange={(e) => {
              setCompany(e.target.value)
              try {
                localStorage.setItem('company', e.target.value)
              } catch {}
            }}
            placeholder="Название компании"
          />

          <div className="flex flex-wrap gap-3">
            <button
              className="btn btn-primary"
              onClick={() => become('buyer')}
              title="Роль для оформления покупок"
            >
              Стать Покупателем
            </button>

            <button
              className="btn btn-primary"
              onClick={() => become('seller')}
              title="Роль для управления товарами"
            >
              Стать Продавцом
            </button>

            {/* По вашей задаче кнопку «Стать администратором» удаляем полностью */}

            <button className="btn" onClick={logout}>
              Выйти
            </button>
          </div>
        </div>

        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-xl font-semibold mb-3">Подсказка</h2>
          <p className="text-gray-600">
            Это демо без бэкенда: здесь вы выбираете роль для просмотра соответствующего кабинета.
            Данные (роль и название компании) сохраняются в <code>localStorage</code>.
          </p>
        </div>
      </div>
    </div>
  )
}
