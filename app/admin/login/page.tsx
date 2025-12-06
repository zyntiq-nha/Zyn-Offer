'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { loginAction } from '@/app/actions/auth'

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)

    try {
      const result = await loginAction(null, formData)

      if (result.error) {
        setError(result.error)
      } else if (result.success && result.admin) {
        // Maintain existing client-side session logic for compatibility
        localStorage.setItem('adminToken', result.admin.id)
        localStorage.setItem('adminEmail', result.admin.email)
        router.push('/admin')
      }
    } catch (err: any) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="w-full py-4 lg:py-6 px-4 sm:px-6 md:px-8 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="relative w-36 lg:w-40 h-10 lg:h-12">
            <Image
              src="/premiumlogo.png"
              alt="Zyntiq Logo"
              fill
              className="object-contain"
              priority
              sizes="(max-width: 768px) 144px, (max-width: 1024px) 160px, 160px"
            />
          </div>
        </div>
      </nav>

      <div className="flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8">
          <h1 className="text-3xl font-bold text-white mb-2 text-center">
            Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#93cfe2] to-[#93cfe2]">Login</span>
          </h1>
          <p className="text-slate-400 text-center mb-8">Access your dashboard</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Email</label>
              <input
                name="email"
                type="email"
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-[#93cfe2] transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Password</label>
              <input
                name="password"
                type="password"
                className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-[#93cfe2] transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-[#93cfe2] to-[#93cfe2] hover:from-[#7ec5db] hover:to-[#7ec5db] disabled:opacity-50 text-slate-900 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-[rgba(147,207,226,0.25)]"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
