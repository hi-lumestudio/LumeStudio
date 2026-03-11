'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Users, Download, Loader2, ToggleLeft, ToggleRight } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface CrmEntry {
  id: string
  customer_phone: string
  first_contact: string
  last_contact: string
  total_messages: number
  last_message: string
  status: string
}

function getStatusStyle(status: string) {
  const s = status?.toLowerCase()
  if (s === 'active') return 'bg-green-100 text-green-700'
  if (s === 'inactive') return 'bg-gray-100 text-gray-600'
  if (s === 'blocked') return 'bg-red-100 text-red-700'
  return 'bg-blue-100 text-blue-700'
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  try { return format(new Date(dateStr), 'MMM d, yyyy') } catch { return dateStr }
}

export default function CrmPage() {
  const [entries, setEntries] = useState<CrmEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const tenantId = user.user_metadata?.tenant_id || 'default'
      const { data } = await supabase
        .from('crm')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('last_contact', { ascending: false })
      setEntries(data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const uniqueStatuses = Array.from(new Set(entries.map((e) => e.status).filter(Boolean)))
  const filtered = entries.filter((e) => {
    const matchesSearch = e.customer_phone?.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const exportToCSV = () => {
    if (filtered.length === 0) {
      toast.error('No data to export')
      return
    }

    // CSV Headers
    const headers = ['Phone', 'First Contact', 'Last Contact', 'Total Messages', 'Last Message', 'Status']
    
    // Format rows
    const rows = filtered.map(e => [
      e.customer_phone || '',
      e.first_contact ? new Date(e.first_contact).toISOString() : '',
      e.last_contact ? new Date(e.last_contact).toISOString() : '',
      e.total_messages?.toString() || '0',
      `"${(e.last_message || '').replace(/"/g, '""')}"`, // Escape quotes
      e.status || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `crm_export_${format(new Date(), 'yyyy-MM-dd')}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Successfully exported CRM data')
  }

  const toggleCustomerStatus = async (id: string, currentStatus: string) => {
    setUpdatingId(id)
    const newStatus = currentStatus.toLowerCase() === 'active' ? 'inactive' : 'active'
    
    const supabase = createClient()
    const { error } = await supabase
      .from('crm')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update status')
      setUpdatingId(null)
      return
    }

    // Update local state
    setEntries(entries.map(e => e.id === id ? { ...e, status: newStatus } : e))
    toast.success(`Customer marked as ${newStatus}`)
    setUpdatingId(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage and track your customers</p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="shrink-0" disabled={loading || filtered.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
        >
          <option value="all">All statuses</option>
          {uniqueStatuses.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">First Contact</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Last Contact</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Messages</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden xl:table-cell">Last Message</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-100 animate-pulse rounded w-24" /></td>
                  ))}
                </tr>
              )) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">
                      {search || statusFilter !== 'all' ? 'No customers match your filters' : 'No customers yet'}
                    </p>
                  </td>
                </tr>
              ) : filtered.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5 font-medium text-gray-900">{entry.customer_phone}</td>
                  <td className="px-4 py-3.5 text-gray-500 hidden sm:table-cell">{formatDate(entry.first_contact)}</td>
                  <td className="px-4 py-3.5 text-gray-500 hidden md:table-cell">{formatDate(entry.last_contact)}</td>
                  <td className="px-4 py-3.5 text-gray-500 hidden lg:table-cell">{entry.total_messages || 0}</td>
                  <td className="px-4 py-3.5 text-gray-500 hidden xl:table-cell max-w-xs">
                    <p className="truncate">{entry.last_message || '—'}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${getStatusStyle(entry.status)}`}>
                        {entry.status || '—'}
                      </span>
                      {updatingId === entry.id ? (
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      ) : (
                        <button
                          onClick={() => toggleCustomerStatus(entry.id, entry.status || 'inactive')}
                          className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none"
                          title={`Toggle to ${(entry.status || 'inactive').toLowerCase() === 'active' ? 'inactive' : 'active'}`}
                        >
                          {(entry.status || 'inactive').toLowerCase() === 'active' ? (
                            <ToggleRight className="w-5 h-5 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">Showing {filtered.length} of {entries.length} customers</p>
          </div>
        )}
      </div>
    </div>
  )
}

