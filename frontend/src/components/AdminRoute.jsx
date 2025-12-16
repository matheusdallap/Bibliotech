'use client'

import { useAuth } from '@/context/AuthContext'
import useAdmin from '@/hooks/useAdmin'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  const isAdmin = useAdmin()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/login')
      return
    }

    if (!isAdmin) {
      router.push('/dashboard')
      return
    }

  }, [loading, user, isAdmin, router])

  if (loading) return <p>Carregando...</p>

  // Bloqueia renderização até a verificação acabar
  if (!user || !isAdmin) return null

  return children
}
