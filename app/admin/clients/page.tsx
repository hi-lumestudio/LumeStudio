'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users, Loader2, Search, Eye } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { updateTenant } from '@/app/admin/actions'

interface Tenant {
  id: string
  business_name: string
  plan: string
  status: string
  ai_limit: number
  subscription_end: string | null
  waha_session: string
  created_at: string
}

function getStatusStyle(status: string) {
  const s = status?.toLowerCase()
  if (s === 'active') return 'bg-green-500/15 text-green-400 border-green-500/20'
  if (s === 'suspended') return 'bg-red-500/15 text-red-400 border-red-500/20'
  if (s === 'trial') return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
  return 'bg-gray-500/15 text-gray-400 border-gray-500/20'
}

export default function ClientsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchTenants() {
      // We use the browser client here, but admin middleware ensures only admins can access this page.
      // For reading tenants, we need to use a server action or API route since RLS blocks this.
      // Let's fetch via a simple approach: call the server action indirectly
      const res = await fetch('/api/admin/tenants')
      if (res.ok) {
        const data = await res.json()
        setTenants(data)
      }
      setLoading(false)
    }
    fetchTenants()
  }, [])

  const handlePlanChange = async (tenantId: string, newPlan: string) => {
    setUpdatingId(tenantId)
    const updates: Record<string, any> = { plan: newPlan }
    if (newPlan === 'pro') {
      updates.ai_limit = 20000
      updates.show_watermark = false
    } else {
      updates.ai_limit = 7500
      updates.show_watermark = true
    }

    const result = await updateTenant(tenantId, updates)
    if (result.success) {
      setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, plan: newPlan, ai_limit: updates.ai_limit } : t))
      toast.success(`Plan diubah ke ${newPlan}`)
    } else {
      toast.error(result.error || 'Gagal mengubah plan')
    }
    setUpdatingId(null)
  }

  const handleStatusChange = async (tenantId: string, newStatus: string) => {
    setUpdatingId(tenantId)
    const result = await updateTenant(tenantId, { status: newStatus })
    if (result.success) {
      setTenants(prev => prev.map(t => t.id === tenantId ? { ...t, status: newStatus } : t))
      toast.success(`Status diubah ke ${newStatus}`)
    } else {
      toast.error(result.error || 'Gagal mengubah status')
    }
    setUpdatingId(null)
  }

  const filtered = tenants.filter(t =>
    t.business_name?.toLowerCase().includes(search.toLowerCase()) ||
    t.waha_session?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Kelola Klien</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage semua tenant Lume Studio</p>
        </div>
        <Link
          href="/admin/clients/new"
          className="flex items-center justify-center gap-2 h-9 px-4 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          + Tambah Klien Baru
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          placeholder="Cari nama bisnis atau session..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full h-10 pl-9 pr-3 rounded-lg border border-gray-700 bg-gray-900 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 placeholder:text-gray-600"
        />
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/30">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Bisnis</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Plan</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">AI Limit</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Session</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Berlangganan s/d</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-800/50">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-800 animate-pulse rounded w-20" /></td>
                  ))}
                </tr>
              )) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">{search ? 'Tidak ditemukan' : 'Belum ada klien'}</p>
                  </td>
                </tr>
              ) : filtered.map((tenant) => (
                <tr key={tenant.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/clients/${tenant.id}`} className="text-white font-medium hover:text-indigo-400 transition-colors">
                      {tenant.business_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={tenant.plan}
                      onChange={(e) => handlePlanChange(tenant.id, e.target.value)}
                      disabled={updatingId === tenant.id}
                      className="h-7 px-2 rounded border border-gray-700 bg-gray-800 text-gray-300 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer"
                    >
                      <option value="starter">Starter</option>
                      <option value="pro">Pro</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={tenant.status}
                      onChange={(e) => handleStatusChange(tenant.id, e.target.value)}
                      disabled={updatingId === tenant.id}
                      className={`h-7 px-2 rounded border text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 cursor-pointer ${getStatusStyle(tenant.status)} bg-transparent`}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="trial">Trial</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-400 hidden md:table-cell">{tenant.ai_limit?.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs hidden lg:table-cell">{tenant.waha_session || '—'}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                    {tenant.subscription_end
                      ? new Date(tenant.subscription_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/admin/clients/${tenant.id}`}
                        className="p-1.5 rounded-md text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                        title="Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-800 bg-gray-800/20">
            <p className="text-xs text-gray-500">Menampilkan {filtered.length} dari {tenants.length} klien</p>
          </div>
        )}
      </div>
    </div>
  )
}
