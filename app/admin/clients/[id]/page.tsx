'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, Save, ArrowLeft, Eye, EyeOff, Copy, Users, ShoppingBag, MessageSquare, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'
import { updateTenant } from '@/app/admin/actions'
import Link from 'next/link'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'

interface TenantDetail {
  id: string
  business_name: string
  plan: string
  status: string
  ai_limit: number
  knowledge_base: any
  ai_prompt: string
  openrouter_api_key: string
  waha_session: string
  owner_phone: string
  show_watermark: boolean
  subscription_end: string | null
  created_at: string
}

interface TenantStats {
  customers: number
  orders: number
  messages: number
}

interface UsageMonth {
  month: string
  ai_responses: number
  total_messages: number
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const tenantId = params.id as string

  const [tenant, setTenant] = useState<TenantDetail | null>(null)
  const [stats, setStats] = useState<TenantStats>({ customers: 0, orders: 0, messages: 0 })
  const [usageHistory, setUsageHistory] = useState<UsageMonth[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  // Editable fields
  const [form, setForm] = useState({
    business_name: '',
    plan: 'starter',
    status: 'active',
    ai_limit: 7500,
    waha_session: '',
    owner_phone: '',
    show_watermark: true,
    subscription_end: '',
    ai_prompt: '',
    openrouter_api_key: '',
    knowledge_base_str: '{}',
  })

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/admin/tenants/${tenantId}`)
      if (!res.ok) { toast.error('Gagal memuat data klien'); setLoading(false); return }
      const data = await res.json()

      setTenant(data.tenant)
      setStats(data.stats)
      setUsageHistory(data.usageHistory || [])

      const t = data.tenant
      setForm({
        business_name: t.business_name || '',
        plan: t.plan || 'starter',
        status: t.status || 'active',
        ai_limit: t.ai_limit || 7500,
        waha_session: t.waha_session || '',
        owner_phone: t.owner_phone || '',
        show_watermark: t.show_watermark !== false,
        subscription_end: t.subscription_end || '',
        ai_prompt: t.ai_prompt || '',
        openrouter_api_key: t.openrouter_api_key || '',
        knowledge_base_str: JSON.stringify(t.knowledge_base || {}, null, 2),
      })

      setLoading(false)
    }
    fetchData()
  }, [tenantId])

  const handleSave = async () => {
    setSaving(true)
    let parsedKb = {}
    try {
      parsedKb = form.knowledge_base_str.trim() ? JSON.parse(form.knowledge_base_str) : {}
    } catch {
      toast.error('Knowledge Base JSON tidak valid')
      setSaving(false)
      return
    }

    const result = await updateTenant(tenantId, {
      business_name: form.business_name,
      plan: form.plan,
      status: form.status,
      ai_limit: form.ai_limit,
      waha_session: form.waha_session,
      owner_phone: form.owner_phone,
      show_watermark: form.show_watermark,
      subscription_end: form.subscription_end || null,
      ai_prompt: form.ai_prompt,
      openrouter_api_key: form.openrouter_api_key,
      knowledge_base: parsedKb,
    })

    if (result.success) {
      toast.success('Data klien berhasil disimpan')
    } else {
      toast.error(result.error || 'Gagal menyimpan')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Klien tidak ditemukan</p>
        <Link href="/admin/clients" className="text-indigo-400 text-sm mt-2 inline-block hover:underline">← Kembali</Link>
      </div>
    )
  }

  const chartData = usageHistory.map(u => ({
    name: new Date(u.month).toLocaleDateString('id-ID', { month: 'short' }),
    'AI Responses': u.ai_responses,
    'Total Pesan': u.total_messages,
  }))

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin/clients')} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">{tenant.business_name}</h1>
            <p className="text-xs text-gray-500 font-mono mt-0.5">{tenant.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/admin/clients/${tenantId}/dashboard`}
            className="flex items-center gap-2 h-9 px-3 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Eye className="w-4 h-4" />
            Impersonate
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 h-9 px-4 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Pelanggan', value: stats.customers, icon: Users },
          { label: 'Pesanan', value: stats.orders, icon: ShoppingBag },
          { label: 'Total Pesan', value: stats.messages, icon: MessageSquare },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500">{s.label}</span>
              <s.icon className="w-4 h-4 text-gray-600" />
            </div>
            <p className="text-xl font-bold text-white">{s.value.toLocaleString('id-ID')}</p>
          </div>
        ))}
      </div>

      {/* Basic Info */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
        <h2 className="font-semibold text-white text-sm uppercase tracking-wide text-gray-400">Informasi Dasar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nama Bisnis" value={form.business_name} onChange={v => setForm(f => ({ ...f, business_name: v }))} />
          <Field label="Owner Phone" value={form.owner_phone} onChange={v => setForm(f => ({ ...f, owner_phone: v }))} placeholder="628xxx" />
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Plan</label>
            <select value={form.plan} onChange={e => {
              const p = e.target.value
              setForm(f => ({ ...f, plan: p, ai_limit: p === 'pro' ? 20000 : 7500, show_watermark: p !== 'pro' }))
            }} className="w-full h-9 px-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600">
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full h-9 px-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600">
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="trial">Trial</option>
            </select>
          </div>
          <Field label="AI Limit" value={form.ai_limit.toString()} onChange={v => setForm(f => ({ ...f, ai_limit: parseInt(v) || 0 }))} type="number" />
          <Field label="WAHA Session" value={form.waha_session} onChange={v => setForm(f => ({ ...f, waha_session: v }))} placeholder="default" />
          <Field label="Berlangganan Sampai" value={form.subscription_end} onChange={v => setForm(f => ({ ...f, subscription_end: v }))} type="date" />
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Watermark</label>
            <button
              onClick={() => setForm(f => ({ ...f, show_watermark: !f.show_watermark }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.show_watermark ? 'bg-indigo-500' : 'bg-gray-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${form.show_watermark ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className="ml-2 text-xs text-gray-500">{form.show_watermark ? 'Aktif' : 'Nonaktif'}</span>
          </div>
        </div>
      </div>

      {/* API Key */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-3">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-400">OpenRouter API Key</h2>
        <div className="flex items-center gap-2">
          <input
            type={showApiKey ? 'text' : 'password'}
            value={form.openrouter_api_key}
            onChange={e => setForm(f => ({ ...f, openrouter_api_key: e.target.value }))}
            className="flex-1 h-9 px-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
          <button onClick={() => setShowApiKey(!showApiKey)} className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors">
            {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
          <button
            onClick={() => { navigator.clipboard.writeText(form.openrouter_api_key); toast.success('API key disalin') }}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* AI Prompt */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-400">AI Prompt (System)</h2>
          <button
            onClick={() => {
              navigator.clipboard.writeText(form.ai_prompt)
              toast.success('Prompt disalin')
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <Copy className="w-3 h-3" /> Salin
          </button>
        </div>
        <textarea
          value={form.ai_prompt}
          onChange={e => setForm(f => ({ ...f, ai_prompt: e.target.value }))}
          rows={16}
          className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-y leading-relaxed"
          placeholder="Masukkan system prompt untuk AI..."
        />
      </div>

      {/* Knowledge Base */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-3">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-400">Knowledge Base (JSON)</h2>
        <textarea
          value={form.knowledge_base_str}
          onChange={e => setForm(f => ({ ...f, knowledge_base_str: e.target.value }))}
          rows={12}
          className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-y leading-relaxed"
          placeholder='{"key": "value"}'
        />
      </div>

      {/* Usage Chart */}
      {chartData.length > 0 && (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-400">Penggunaan AI (6 Bulan Terakhir)</h2>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#e5e7eb' }}
                  labelStyle={{ color: '#9ca3af' }}
                />
                <Bar dataKey="AI Responses" fill="#818cf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Total Pesan" fill="#4b5563" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 px-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 placeholder:text-gray-600"
      />
    </div>
  )
}
