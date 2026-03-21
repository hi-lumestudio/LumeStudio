import { createAdminClient } from '@/lib/supabase/admin'
import { Users, DollarSign, Activity, MessageSquare, ExternalLink } from 'lucide-react'
import Link from 'next/link'

function formatRupiah(num: number) {
  return 'Rp ' + num.toLocaleString('id-ID')
}

function getStatusStyle(status: string) {
  const s = status?.toLowerCase()
  if (s === 'active') return 'bg-green-500/15 text-green-400 border-green-500/20'
  if (s === 'suspended') return 'bg-red-500/15 text-red-400 border-red-500/20'
  if (s === 'trial') return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
  return 'bg-gray-500/15 text-gray-400 border-gray-500/20'
}

export default async function AdminOverviewPage() {
  const supabase = createAdminClient()

  // Current month for usage queries
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  // Fetch all data in parallel
  const [
    { data: tenants },
    { count: totalCustomers },
    { data: monthlyUsage },
    { data: monthOrders },
  ] = await Promise.all([
    supabase.from('tenants').select('id, business_name, plan, status, ai_limit, subscription_end, created_at').order('created_at', { ascending: false }),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('monthly_usage').select('tenant_id, ai_responses, total_messages').eq('month', currentMonth),
    supabase.from('orders_v2').select('revenue, status').eq('status', 'confirmed').gte('created_at', currentMonth),
  ])

  const allTenants = tenants || []
  const activeClients = allTenants.filter(t => t.status === 'active').length
  const totalAiResponses = (monthlyUsage || []).reduce((sum, u) => sum + (u.ai_responses || 0), 0)
  const totalRevenue = (monthOrders || []).reduce((sum, o) => sum + (Number(o.revenue) || 0), 0)

  // Build usage map for quick lookup
  const usageMap: Record<string, { ai_responses: number; total_messages: number }> = {}
  ;(monthlyUsage || []).forEach(u => {
    usageMap[u.tenant_id] = { ai_responses: u.ai_responses || 0, total_messages: u.total_messages || 0 }
  })

  const stats = [
    { label: 'Klien Aktif', value: activeClients.toString(), icon: Users, color: 'bg-indigo-500/15 text-indigo-400' },
    { label: 'Pendapatan Bulan Ini', value: formatRupiah(totalRevenue), icon: DollarSign, color: 'bg-green-500/15 text-green-400' },
    { label: 'AI Responses Bulan Ini', value: totalAiResponses.toLocaleString('id-ID'), icon: Activity, color: 'bg-purple-500/15 text-purple-400' },
    { label: 'Total Pelanggan', value: (totalCustomers || 0).toLocaleString('id-ID'), icon: MessageSquare, color: 'bg-cyan-500/15 text-cyan-400' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Ringkasan Admin</h1>
        <p className="text-sm text-gray-400 mt-0.5">Overview seluruh klien Lume Studio</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-gray-900 rounded-xl border border-gray-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-400">{stat.label}</span>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Clients Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="font-semibold text-white">Semua Klien</h2>
          <Link
            href="/admin/clients"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            Kelola <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/30">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Bisnis</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Plan</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">AI Usage</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Berlangganan s/d</th>
              </tr>
            </thead>
            <tbody>
              {allTenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Belum ada klien</p>
                  </td>
                </tr>
              ) : allTenants.map((tenant) => {
                const usage = usageMap[tenant.id] || { ai_responses: 0, total_messages: 0 }
                const usagePct = tenant.ai_limit ? Math.round((usage.ai_responses / tenant.ai_limit) * 100) : 0
                return (
                  <tr key={tenant.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/clients/${tenant.id}`} className="text-white font-medium hover:text-indigo-400 transition-colors">
                        {tenant.business_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                        tenant.plan === 'pro'
                          ? 'bg-indigo-500/15 text-indigo-400'
                          : 'bg-gray-700/50 text-gray-400'
                      }`}>
                        {tenant.plan?.charAt(0).toUpperCase() + tenant.plan?.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${getStatusStyle(tenant.status)}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full ${usagePct >= 80 ? 'bg-red-500' : usagePct >= 60 ? 'bg-yellow-400' : 'bg-green-500'}`}
                            style={{ width: `${Math.min(usagePct, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{usage.ai_responses}/{tenant.ai_limit || '∞'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell text-xs">
                      {tenant.subscription_end
                        ? new Date(tenant.subscription_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
