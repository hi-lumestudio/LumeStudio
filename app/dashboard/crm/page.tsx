'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Users, Download, Loader2, Bot, UserRound, Pencil, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface CrmEntry {
  id: string
  phone: string
  name: string | null
  first_contact: string
  last_contact: string
  message_count: number
  last_preview: string
  status: string
  ai_enabled: boolean
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
  const [editingNameId, setEditingNameId] = useState<string | null>(null)
  const [editNameValue, setEditNameValue] = useState('')

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('customers')
        .select('*')
        .eq('tenant_id', user.id)
        .order('last_contact', { ascending: false })
      setEntries(data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const uniqueStatuses = Array.from(new Set(entries.map((e) => e.status).filter(Boolean)))
  const filtered = entries.filter((e) => {
    const matchesSearch = (e.phone?.toLowerCase().includes(search.toLowerCase()) || e.name?.toLowerCase().includes(search.toLowerCase()))
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
      e.phone || '',
      e.first_contact ? new Date(e.first_contact).toISOString() : '',
      e.last_contact ? new Date(e.last_contact).toISOString() : '',
      e.message_count?.toString() || '0',
      `"${(e.last_preview || '').replace(/"/g, '""')}"`, // Escape quotes
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
      .from('customers')
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
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Pelanggan</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden sm:table-cell">First Contact</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Last Contact</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Messages</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden xl:table-cell">Last Message</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">AI</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-100 animate-pulse rounded w-24" /></td>
                  ))}
                </tr>
              )) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">
                      {search || statusFilter !== 'all' ? 'No customers match your filters' : 'No customers yet'}
                    </p>
                  </td>
                </tr>
              ) : filtered.map((entry) => (
                <tr key={entry.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5">
                    {editingNameId === entry.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="text"
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key === 'Enter') {
                              const supabase = createClient()
                              const { error } = await supabase.from('customers').update({ name: editNameValue.trim() || null }).eq('id', entry.id)
                              if (error) { toast.error('Gagal menyimpan nama'); return }
                              setEntries(entries.map(x => x.id === entry.id ? { ...x, name: editNameValue.trim() || null } : x))
                              toast.success('Nama pelanggan diperbarui')
                              setEditingNameId(null)
                            }
                            if (e.key === 'Escape') setEditingNameId(null)
                          }}
                          autoFocus
                          placeholder="Ketik nama..."
                          className="h-7 w-32 px-2 rounded border border-green-300 text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                        <button
                          onClick={async () => {
                            const supabase = createClient()
                            const { error } = await supabase.from('customers').update({ name: editNameValue.trim() || null }).eq('id', entry.id)
                            if (error) { toast.error('Gagal menyimpan nama'); return }
                            setEntries(entries.map(x => x.id === entry.id ? { ...x, name: editNameValue.trim() || null } : x))
                            toast.success('Nama pelanggan diperbarui')
                            setEditingNameId(null)
                          }}
                          className="p-1 rounded text-green-600 hover:bg-green-50"
                        ><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setEditingNameId(null)} className="p-1 rounded text-gray-400 hover:bg-gray-100">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 group">
                        <div>
                          <p className="font-medium text-gray-900">{entry.name || entry.phone}</p>
                          {entry.name && <p className="text-xs text-gray-400">{entry.phone}</p>}
                        </div>
                        <button
                          onClick={() => { setEditingNameId(entry.id); setEditNameValue(entry.name || '') }}
                          className="p-1 rounded text-gray-300 opacity-0 group-hover:opacity-100 hover:text-gray-600 hover:bg-gray-100 transition-all"
                          title="Edit nama"
                        ><Pencil className="w-3 h-3" /></button>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 hidden sm:table-cell">{formatDate(entry.first_contact)}</td>
                  <td className="px-4 py-3.5 text-gray-500 hidden md:table-cell">{formatDate(entry.last_contact)}</td>
                  <td className="px-4 py-3.5 text-gray-500 hidden lg:table-cell">{entry.message_count || 0}</td>
                  <td className="px-4 py-3.5 text-gray-500 hidden xl:table-cell max-w-xs">
                    <p className="truncate">{entry.last_preview || '—'}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${getStatusStyle(entry.status)}`}>
                      {entry.status || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    {updatingId === entry.id ? (
                      <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                    ) : (
                      <button
                        onClick={async () => {
                          setUpdatingId(entry.id)
                          const newValue = !(entry.ai_enabled ?? true)
                          const supabase = createClient()
                          const { error } = await supabase.from('customers').update({ ai_enabled: newValue }).eq('id', entry.id)
                          if (error) { toast.error('Gagal mengubah status AI'); setUpdatingId(null); return }
                          setEntries(entries.map(e => e.id === entry.id ? { ...e, ai_enabled: newValue } : e))
                          toast.success(newValue ? 'AI diaktifkan' : 'AI dinonaktifkan — mode manual')
                          setUpdatingId(null)
                        }}
                        className="flex items-center gap-1.5 group focus:outline-none"
                        title={entry.ai_enabled !== false ? 'Klik untuk nonaktifkan AI' : 'Klik untuk aktifkan AI'}
                      >
                        {entry.ai_enabled !== false ? (
                          <>
                            <Bot className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200 group-hover:bg-green-100 transition-colors">
                              AI Aktif
                            </span>
                          </>
                        ) : (
                          <>
                            <UserRound className="w-4 h-4 text-orange-500" />
                            <span className="text-xs font-medium text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200 group-hover:bg-orange-100 transition-colors">
                              Manual
                            </span>
                          </>
                        )}
                      </button>
                    )}
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

