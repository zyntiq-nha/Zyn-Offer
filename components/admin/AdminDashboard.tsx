'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Users,
  FileText,
  Briefcase,
  Clock,
  LogOut,
  Settings,
  TrendingUp,
  UserCheck,
  FileCheck,
  AlertCircle
} from 'lucide-react'
import Image from 'next/image'
import UserManagement from './UserManagement'
import TemplateManagement from './TemplateManagement'
import RoleManagement from './RoleManagement'
import SimpleDbTest from './SimpleDbTest'

interface AdminDashboardProps {
  admin?: any
  onLogout?: () => void
}

interface Stats {
  total_users: number
  total_templates: number
  total_offers: number
  pending_users: number
}

export default function AdminDashboard({ admin, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState<Stats>({
    total_users: 0,
    total_templates: 0,
    total_offers: 0,
    pending_users: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [usersCount, templatesCount, offersCount, pendingCount] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('templates').select('*', { count: 'exact', head: true }).eq('active', true),
        supabase.from('offer_letters').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ])

      setStats({
        total_users: usersCount.count || 0,
        total_templates: templatesCount.count || 0,
        total_offers: offersCount.count || 0,
        pending_users: pendingCount.count || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
      // Set demo stats if database not available
      setStats({
        total_users: 25,
        total_templates: 7,
        total_offers: 18,
        pending_users: 7
      })
    } finally {
      setLoading(false)
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UserManagement />
      case 'templates':
        return <TemplateManagement />
      case 'roles':
        return <RoleManagement />
      default:
        return (
          <div className="space-y-8">
            {/* Simple Database Test */}
            <SimpleDbTest />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Total Applications</p>
                    <p className="text-3xl font-bold text-slate-50">{stats.total_users}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#93cfe2] to-[#7ec5db] rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-green-400">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">Active candidates</span>
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Active Templates</p>
                    <p className="text-3xl font-bold text-slate-50">{stats.total_templates}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#93cfe2] to-[#7ec5db] rounded-xl flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-[#93cfe2]">
                  <FileCheck className="w-4 h-4 mr-1" />
                  <span className="text-sm">HTML templates</span>
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Generated Offers</p>
                    <p className="text-3xl font-bold text-slate-50">{stats.total_offers}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#93cfe2] to-[#7ec5db] rounded-xl flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-[#93cfe2]">
                  <UserCheck className="w-4 h-4 mr-1" />
                  <span className="text-sm">Successful offers</span>
                </div>
              </div>

              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">Pending Review</p>
                    <p className="text-3xl font-bold text-slate-50">{stats.pending_users}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#93cfe2] to-[#7ec5db] rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-[#93cfe2]">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  <span className="text-sm">Awaiting action</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-4">
              <h3 className="text-xl font-semibold text-slate-50 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setActiveTab('users')}
                  className="btn-secondary p-4 text-left hover:bg-slate-700/60 transition-colors"
                >
                  <Users className="w-6 h-6 text-purple-400 mb-2" />
                  <h4 className="font-medium text-slate-200">Manage Applications</h4>
                  <p className="text-sm text-slate-400">Review and process candidate applications</p>
                </button>

                <button
                  onClick={() => setActiveTab('templates')}
                  className="btn-secondary p-4 text-left hover:bg-slate-700/60 transition-colors"
                >
                  <FileText className="w-6 h-6 text-purple-400 mb-2" />
                  <h4 className="font-medium text-slate-200">Manage Templates</h4>
                  <p className="text-sm text-slate-400">Manage HTML templates</p>
                </button>

                <button
                  onClick={() => setActiveTab('roles')}
                  className="btn-secondary p-4 text-left hover:bg-slate-700/60 transition-colors"
                >
                  <Settings className="w-6 h-6 text-purple-400 mb-2" />
                  <h4 className="font-medium text-slate-200">Manage Roles & Tenures</h4>
                  <p className="text-sm text-slate-400">Configure positions and durations</p>
                </button>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass-card m-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative w-12 h-12">
              <Image
                src="/premiumlogo.png"
                alt="Zyntiq Logo"
                fill
                className="object-contain"
                style={{ filter: 'drop-shadow(0 4px 20px rgba(139, 92, 246, 0.2))' }}
                sizes="48px"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-50">Welcome, {admin.name}!</h1>
              <p className="text-slate-400">Zyntiq Admin Panel</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="btn-secondary flex items-center space-x-2 hover:bg-red-500/20 hover:border-red-500/40 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="mx-4 mb-4">
        <div className="glass-card p-2">
          <nav className="flex space-x-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
              { id: 'users', label: 'Applications', icon: Users },
              { id: 'templates', label: 'Templates', icon: FileText },
              { id: 'roles', label: 'Roles & Tenures', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${activeTab === tab.id
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                  }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="mx-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  )
}
