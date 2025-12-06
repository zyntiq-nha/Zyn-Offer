'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default function AdminPage() {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const [authed, setAuthed] = useState(false)
  const [admin, setAdmin] = useState<any>(null)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
    const email = typeof window !== 'undefined' ? localStorage.getItem('adminEmail') : null
    
    if (!token) {
      router.replace('/admin/login')
    } else {
      setAuthed(true)
      // Create admin object from localStorage
      setAdmin({
        id: token,
        email: email || 'admin@system.com',
        name: 'System Admin'
      })
    }
    setIsReady(true)
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminEmail')
    router.replace('/admin/login')
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#93cfe2] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!authed) return null

  return (
    <div className="min-h-screen">
      <AdminDashboard admin={admin} onLogout={handleLogout} />
    </div>
  )
}
