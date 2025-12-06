'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { supabase, User } from '@/lib/supabase'
import { generateOfferLetter, OfferLetterData } from '@/lib/docx-generator'
import {
  Eye,
  FileDown,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          *,
          role:roles(name, code),
          tenure:tenures(label, months)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) throw error
      await fetchUsers()
      alert(`Status updated to ${status}`)
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update status')
    }
  }

  const generateOffer = async (userId: string) => {
    try {
      const user = users.find(u => u.id === userId)
      if (!user || !user.role || !user.tenure) {
        alert('User data incomplete')
        return
      }

      const data: OfferLetterData = {
        candidateName: `${user.first_name} ${user.last_name}`,
        roleCode: user.role.code,
        tenureMonths: user.tenure.months,
        roleName: user.role.name,
        tenureLabel: user.tenure.label,
        userId: user.id
      }

      await generateOfferLetter(data)
      await updateUserStatus(userId, 'offer_generated')

      alert('Offer letter generated and downloaded successfully!')
    } catch (error) {
      console.error('Error generating offer:', error)
      alert('Failed to generate offer letter. Please try again.')
    }
  }



  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Group users by year and month
  interface GroupedUsers {
    [year: string]: {
      [month: string]: User[]
    }
  }

  const groupedUsers: GroupedUsers = filteredUsers.reduce((acc, user) => {
    const date = new Date(user.created_at)
    const year = date.getFullYear().toString()
    const month = date.toLocaleString('default', { month: 'long' })

    if (!acc[year]) acc[year] = {}
    if (!acc[year][month]) acc[year][month] = []
    acc[year][month].push(user)

    return acc
  }, {} as GroupedUsers)

  // Get current month and year
  const currentDate = new Date()
  const currentYear = currentDate.getFullYear().toString()
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' })

  // Initialize expanded groups with current month on first render
  useEffect(() => {
    const currentKey = `${currentYear}-${currentMonth}`
    setExpandedGroups(new Set([currentKey]))
  }, [currentYear, currentMonth])

  const toggleGroup = (year: string, month: string) => {
    const key = `${year}-${month}`
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </span>
        )
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        )
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        )
      case 'offer_generated':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <FileDown className="w-3 h-3 mr-1" />
            Offer Generated
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400 border border-slate-500/30">
            {status}
          </span>
        )
    }
  }

  const detailItems: {
    label: string
    value: string
    valueClassName?: string
    fullWidth?: boolean
  }[] = useMemo(() => {
    if (!selectedUser) return []
    return [
      {
        label: 'Full Name',
        value: `${selectedUser.first_name} ${selectedUser.last_name}`.trim(),
      },
      {
        label: "Father's Name",
        value: selectedUser.father_name || '—',
      },
      {
        label: 'Email',
        value: selectedUser.email,
        valueClassName: 'break-words',
      },
      {
        label: 'Phone',
        value: selectedUser.phone || '—',
      },
      {
        label: 'Position',
        value: selectedUser.role?.name || '—',
      },
      {
        label: 'Duration',
        value: selectedUser.tenure?.label || '—',
      },
      {
        label: 'College / University',
        value: selectedUser.college_name || '—',
      },
      {
        label: 'Address',
        value: selectedUser.address || '—',
        fullWidth: true,
        valueClassName: 'whitespace-pre-wrap',
      },
    ];
  }, [selectedUser]);

  const documentItems: { label: string; url: string | null | undefined }[] = useMemo(() => {
    if (!selectedUser) return []
    return [
      { label: 'Photo', url: selectedUser.photo_url },
      { label: 'Aadhar Front', url: selectedUser.aadhar_front_url },
      { label: 'Aadhar Back', url: selectedUser.aadhar_back_url },
      { label: 'College ID', url: selectedUser.college_id_url },
      { label: '12th Marksheet', url: selectedUser.marksheet_12th_url },
    ];
  }, [selectedUser]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-50">Application Management</h2>
          <p className="text-slate-400">Review and manage candidate applications</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchUsers}
            className="btn-secondary flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-3">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field w-full pl-10"
              />
            </div>
          </div>
          <div className="md:w-48">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field w-full pl-10 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="offer_generated">Offer Generated</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Grouped by Month/Year */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            {Object.keys(groupedUsers).sort((a, b) => parseInt(b) - parseInt(a)).map(year => (
              <div key={year} className="space-y-2">
                {/* Year Header */}
                <h3 className="text-xl font-bold text-slate-50 mb-3">{year}</h3>

                {Object.keys(groupedUsers[year]).map(month => {
                  const groupKey = `${year}-${month}`
                  const isExpanded = expandedGroups.has(groupKey)
                  const isCurrentMonth = year === currentYear && month === currentMonth
                  const monthUsers = groupedUsers[year][month]

                  // Apply pagination to current expanded group
                  const displayUsers = isExpanded
                    ? monthUsers.slice(startIndex, endIndex)
                    : []

                  return (
                    <div key={month} className="border border-slate-700 rounded-lg overflow-hidden">
                      {/* Month Header - Clickable */}
                      <button
                        onClick={() => toggleGroup(year, month)}
                        className="w-full flex items-center justify-between p-4 bg-slate-800/50 hover:bg-slate-800/70 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-purple-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-slate-400" />
                          )}
                          <h4 className="text-lg font-semibold text-slate-200">
                            {month}
                            {isCurrentMonth && (
                              <span className="ml-2 text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full border border-purple-500/30">
                                Current
                              </span>
                            )}
                          </h4>
                        </div>
                        <span className="text-sm text-slate-400">
                          {monthUsers.length} {monthUsers.length === 1 ? 'applicant' : 'applicants'}
                        </span>
                      </button>

                      {/* Collapsible Content */}
                      {isExpanded && (
                        <div className="overflow-x-auto">
                          <table className="professional-table w-full">
                            <thead>
                              <tr>
                                <th className="text-left">Candidate</th>
                                <th className="text-left">Position</th>
                                <th className="text-left hidden md:table-cell">Duration</th>
                                <th className="text-left">Status</th>
                                <th className="text-left hidden sm:table-cell">Applied</th>
                                <th className="text-left">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {displayUsers.map((user) => (
                                <tr key={user.id}>
                                  <td>
                                    <div>
                                      <div className="font-medium text-slate-200">
                                        {user.first_name} {user.last_name}
                                      </div>
                                      <div className="text-sm text-slate-400">{user.email}</div>
                                    </div>
                                  </td>
                                  <td>
                                    <span className="text-slate-300">
                                      {user.role?.name || 'N/A'}
                                    </span>
                                  </td>
                                  <td className="hidden md:table-cell">
                                    <span className="text-slate-300">
                                      {user.tenure?.label || 'N/A'}
                                    </span>
                                  </td>
                                  <td>{getStatusBadge(user.status)}</td>
                                  <td className="hidden sm:table-cell">
                                    <span className="text-slate-400">
                                      {new Date(user.created_at).toLocaleDateString()}
                                    </span>
                                  </td>
                                  <td>
                                    <div className="flex items-center space-x-2">
                                      <button
                                        onClick={() => setSelectedUser(user)}
                                        className="p-2 text-slate-400 hover:text-purple-400 transition-colors"
                                        title="View Details"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </button>

                                      {user.status === 'pending' && (
                                        <>
                                          <button
                                            onClick={() => updateUserStatus(user.id, 'approved')}
                                            className="p-2 text-slate-400 hover:text-green-400 transition-colors hidden sm:inline-block"
                                            title="Approve"
                                          >
                                            <CheckCircle className="w-4 h-4" />
                                          </button>
                                          <button
                                            onClick={() => updateUserStatus(user.id, 'rejected')}
                                            className="p-2 text-slate-400 hover:text-red-400 transition-colors hidden sm:inline-block"
                                            title="Reject"
                                          >
                                            <XCircle className="w-4 h-4" />
                                          </button>
                                        </>
                                      )}

                                      {user.status === 'approved' && (
                                        <button
                                          onClick={() => generateOffer(user.id)}
                                          className="p-2 text-slate-400 hover:text-purple-400 transition-colors hidden sm:inline-block"
                                          title="Generate Offer"
                                        >
                                          <FileDown className="w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>

                          {/* Pagination for this month */}
                          {monthUsers.length > pageSize && (
                            <div className="p-4 border-t border-slate-700">
                              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-slate-400">
                                  Showing <span className="text-slate-200 font-medium">{startIndex + 1}</span> to{' '}
                                  <span className="text-slate-200 font-medium">{Math.min(endIndex, monthUsers.length)}</span> of{' '}
                                  <span className="text-slate-200 font-medium">{monthUsers.length}</span> results
                                </div>

                                <div className="flex items-center gap-2">
                                  <label className="text-sm text-slate-400">Show:</label>
                                  <select
                                    value={pageSize}
                                    onChange={(e) => {
                                      setPageSize(Number(e.target.value))
                                      setCurrentPage(1)
                                    }}
                                    className="input-field py-1 px-2 text-sm"
                                  >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                  </select>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                  >
                                    Previous
                                  </button>
                                  <span className="text-sm text-slate-400">
                                    Page <span className="text-slate-200 font-medium">{currentPage}</span> of{' '}
                                    <span className="text-slate-200 font-medium">{Math.ceil(monthUsers.length / pageSize)}</span>
                                  </span>
                                  <button
                                    onClick={() => setCurrentPage(prev => Math.min(Math.ceil(monthUsers.length / pageSize), prev + 1))}
                                    disabled={currentPage === Math.ceil(monthUsers.length / pageSize)}
                                    className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                                  >
                                    Next
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400">No applications found</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div
            className="glass-card w-full max-w-5xl mx-4 md:mx-auto my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm flex items-center justify-between p-4 sm:p-6 border-b border-slate-700 z-10">
              <h3 className="text-lg sm:text-xl font-semibold text-slate-50">Application Details</h3>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-4 sm:p-6 space-y-8">
              <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-400">Candidate Status</p>
                    <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
                  </div>
                  <div className="text-sm text-slate-400">
                    Applied on{' '}
                    <span className="font-semibold text-slate-200">
                      {new Date(selectedUser.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {detailItems.map((item) => (
                    <div
                      key={item.label}
                      className={`bg-slate-800/40 rounded-lg border border-slate-700/60 p-3 shadow-sm ${item.fullWidth ? 'sm:col-span-2 lg:col-span-3' : ''}`}
                    >
                      <p className="text-xs uppercase tracking-wide text-slate-400 font-medium">
                        {item.label}
                      </p>
                      <p className={`mt-1 text-sm font-semibold text-slate-100 leading-snug ${item.valueClassName || ''}`}>
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h4 className="text-lg font-semibold text-slate-200">Documents</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {documentItems.map(({ label, url }) => (
                    <div
                      key={label}
                      className="bg-slate-800/40 rounded-lg border border-slate-700/60 p-3 flex flex-col gap-3"
                    >
                      <p className="text-xs uppercase tracking-wide text-slate-400 font-medium">
                        {label}
                      </p>
                      {url ? (
                        <>
                          <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden border border-slate-700">
                            <Image
                              src={url}
                              alt={label}
                              fill
                              sizes="(min-width: 1280px) 18vw, (min-width: 768px) 30vw, 80vw"
                              className="object-cover transition-transform duration-300 hover:scale-[1.02]"
                              onClick={() => window.open(url, '_blank')}
                              title="Click to view full size"
                            />
                          </div>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-md border border-[#93cfe2]/40 px-3 py-1.5 text-xs font-medium text-[#93cfe2] hover:bg-[#93cfe2]/10 transition-colors"
                          >
                            <Eye className="w-3 h-3" />
                            Open
                          </a>
                        </>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Not uploaded</span>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                {selectedUser.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => updateUserStatus(selectedUser.id, 'approved')}
                      className="btn-primary flex-1 flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => updateUserStatus(selectedUser.id, 'rejected')}
                      className="btn-secondary flex-1 flex items-center justify-center space-x-2"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}

                {selectedUser.status === 'approved' && (
                  <button
                    onClick={() => generateOffer(selectedUser.id)}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Generate Offer Letter</span>
                  </button>
                )}
              </section>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
