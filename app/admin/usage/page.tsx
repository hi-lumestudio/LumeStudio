import { createAdminClient } from '@/lib/supabase/admin'
import { Activity, AlertTriangle } from 'lucide-react'

export default async function UsagePage() {
  const supabase = createAdminClient()

  // Current month
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`

  // Fetch tenants + usage
  const [{ data: tenants }, { data: usageData }] = await Promise.all([
    supabase.from('tenants').select('id, business_name, plan, ai_limit, status').order('business_name'),
    supabase.from('monthly_usage').select('tenant_id, ai_responses, total_messages, month').eq('month', currentMonth),
  ])

  // Also get last 6 months total for chart
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
  const sixMonthStr = `${sixMonthsAgo.getFullYear()}-${String(sixMonthsAgo.getMonth() + 1).padStart(2, '0')}-01`

  const { data: allUsage } = await supabase
    .from('monthly_usage')
    .select('month, ai_responses, total_messages')
    .gte('month', sixMonthStr)
    .order('month')

  const usageMap: Record<string, { ai_responses: number; total_messages: number }> = {}
  ;(usageData || []).forEach(u => {
    usageMap[u.tenant_id] = { ai_responses: u.ai_responses || 0, total_messages: u.total_messages || 0 }
  })

  // Aggregate monthly totals for chart
  const monthTotals: Record<string, number> = {}
  ;(allUsage || []).forEach(u => {
    monthTotals[u.month] = (monthTotals[u.month] || 0) + (u.ai_responses || 0)
  })

  const allTenants = tenants || []
  const clientUsage = allTenants.map(t => {
    const usage = usageMap[t.id] || { ai_responses: 0, total_messages: 0 }
    const pct = t.ai_limit ? Math.round((usage.ai_responses / t.ai_limit) * 100) : 0
    return { ...t, ...usage, pct }
  }).sort((a, b) => b.pct - a.pct)

  const nearQuota = clientUsage.filter(c => c.pct >= 80)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Penggunaan AI</h1>
        <p className="text-sm text-gray-400 mt-0.5">Monitor kuota AI seluruh klien bulan ini</p>
      </div>

      {/* Alerts */}
      {nearQuota.length > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-semibold text-yellow-400">{nearQuota.length} klien mendekati kuota!</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {nearQuota.map(c => (
              <span key={c.id} className="text-xs bg-yellow-500/15 text-yellow-300 px-2.5 py-1 rounded-full border border-yellow-500/20">
                {c.business_name} ({c.pct}%)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Usage Chart Summary */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Total AI Responses per Bulan (6 Bulan)</h2>
        <div className="flex items-end gap-2 h-32">
          {Object.entries(monthTotals).sort(([a], [b]) => a.localeCompare(b)).map(([month, total]) => {
            const maxVal = Math.max(...Object.values(monthTotals), 1)
            const height = Math.max((total / maxVal) * 100, 4)
            const label = new Date(month).toLocaleDateString('id-ID', { month: 'short' })
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">{total.toLocaleString('id-ID')}</span>
                <div className="w-full bg-gray-800 rounded-t-md overflow-hidden" style={{ height: '100px' }}>
                  <div
                    className="w-full bg-indigo-500 rounded-t-md transition-all"
                    style={{ height: `${height}%`, marginTop: `${100 - height}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Client Usage Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-gray-500" />
            Detail per Klien
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/30">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Bisnis</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Plan</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">AI Responses</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Limit</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Penggunaan</th>
              </tr>
            </thead>
            <tbody>
              {clientUsage.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-gray-500 text-sm">Belum ada data</td>
                </tr>
              ) : clientUsage.map(c => (
                <tr key={c.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{c.business_name}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${c.plan === 'pro' ? 'bg-indigo-500/15 text-indigo-400' : 'bg-gray-700/50 text-gray-400'}`}>
                      {c.plan?.charAt(0).toUpperCase() + c.plan?.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{c.ai_responses.toLocaleString('id-ID')}</td>
                  <td className="px-4 py-3 text-gray-500">{c.ai_limit?.toLocaleString('id-ID') || '∞'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full ${c.pct >= 80 ? 'bg-red-500' : c.pct >= 60 ? 'bg-yellow-400' : 'bg-green-500'}`}
                          style={{ width: `${Math.min(c.pct, 100)}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${c.pct >= 80 ? 'text-red-400' : c.pct >= 60 ? 'text-yellow-400' : 'text-gray-400'}`}>
                        {c.pct}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
