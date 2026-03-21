'use client'

import { useEffect, useState } from 'react'
import { DollarSign, Plus, Trash2, Loader2, AlertTriangle, Clock, X, CheckCircle, XCircle, ImageIcon, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'
import { recordPayment, deletePayment, approvePaymentProof, rejectPaymentProof } from '@/app/admin/actions'

interface Tenant {
  id: string
  business_name: string
  plan: string
  subscription_end: string | null
}

interface Payment {
  id: string
  tenant_id: string
  amount: number
  payment_date: string
  period_start: string | null
  period_end: string | null
  notes: string | null
  created_at: string
}

function formatRupiah(num: number) {
  return 'Rp ' + num.toLocaleString('id-ID')
}

export default function RevenuePage() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Payment proofs state
  const [proofs, setProofs] = useState<any[]>([])
  const [processingProofId, setProcessingProofId] = useState<string | null>(null)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const [form, setForm] = useState({
    tenantId: '',
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    periodStart: '',
    periodEnd: '',
    notes: '',
  })

  useEffect(() => {
    async function fetchData() {
      const [tenantsRes, paymentsRes, proofsRes] = await Promise.all([
        fetch('/api/admin/tenants'),
        fetch('/api/admin/payments'),
        fetch('/api/admin/payment-proofs'),
      ])
      if (tenantsRes.ok) setTenants(await tenantsRes.json())
      if (paymentsRes.ok) setPayments(await paymentsRes.json())
      if (proofsRes.ok) setProofs(await proofsRes.json())
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.tenantId || !form.amount) {
      toast.error('Pilih klien dan masukkan jumlah')
      return
    }
    setSubmitting(true)
    const result = await recordPayment({
      tenantId: form.tenantId,
      amount: Number(form.amount),
      paymentDate: form.paymentDate,
      periodStart: form.periodStart,
      periodEnd: form.periodEnd,
      notes: form.notes,
    })
    if (result.success) {
      toast.success('Pembayaran tercatat')
      setShowForm(false)
      setForm({ tenantId: '', amount: '', paymentDate: new Date().toISOString().split('T')[0], periodStart: '', periodEnd: '', notes: '' })
      // Refresh payments
      const res = await fetch('/api/admin/payments')
      if (res.ok) setPayments(await res.json())
    } else {
      toast.error(result.error || 'Gagal mencatat pembayaran')
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus catatan pembayaran ini?')) return
    setDeletingId(id)
    const result = await deletePayment(id)
    if (result.success) {
      setPayments(prev => prev.filter(p => p.id !== id))
      toast.success('Pembayaran dihapus')
    } else {
      toast.error('Gagal menghapus')
    }
    setDeletingId(null)
  }

  const handleApproveProof = async (proofId: string) => {
    setProcessingProofId(proofId)
    const result = await approvePaymentProof(proofId)
    if (result.success) {
      setProofs(prev => prev.map(p => p.id === proofId ? { ...p, status: 'approved' } : p))
      toast.success('Bukti transfer disetujui & pembayaran tercatat')
      // Refresh payments since approve auto-records
      const res = await fetch('/api/admin/payments')
      if (res.ok) setPayments(await res.json())
    } else {
      toast.error(result.error || 'Gagal approve')
    }
    setProcessingProofId(null)
  }

  const handleRejectProof = async (proofId: string) => {
    const reason = prompt('Alasan penolakan (opsional):')
    setProcessingProofId(proofId)
    const result = await rejectPaymentProof(proofId, reason || undefined)
    if (result.success) {
      setProofs(prev => prev.map(p => p.id === proofId ? { ...p, status: 'rejected' } : p))
      toast.success('Bukti transfer ditolak')
    } else {
      toast.error(result.error || 'Gagal reject')
    }
    setProcessingProofId(null)
  }

  const tenantMap: Record<string, string> = {}
  tenants.forEach(t => { tenantMap[t.id] = t.business_name })

  const now = new Date()
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const thisYear = now.getFullYear().toString()

  const revenueThisMonth = payments
    .filter(p => p.payment_date?.startsWith(thisMonth))
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  const revenueThisYear = payments
    .filter(p => p.payment_date?.startsWith(thisYear))
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0)

  // Overdue & expiring soon
  const today = now.toISOString().split('T')[0]
  const sevenDaysLater = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0]
  const overdue = tenants.filter(t => t.subscription_end && t.subscription_end < today)
  const expiringSoon = tenants.filter(t => t.subscription_end && t.subscription_end >= today && t.subscription_end <= sevenDaysLater)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pendapatan & Pembayaran</h1>
          <p className="text-sm text-gray-400 mt-0.5">Tracking pembayaran langganan klien</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 h-9 px-4 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Catat Pembayaran
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <p className="text-xs text-gray-500 mb-1">Pendapatan Bulan Ini</p>
          <p className="text-2xl font-bold text-green-400">{formatRupiah(revenueThisMonth)}</p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-5">
          <p className="text-xs text-gray-500 mb-1">Pendapatan Tahun {thisYear}</p>
          <p className="text-2xl font-bold text-white">{formatRupiah(revenueThisYear)}</p>
        </div>
      </div>

      {/* Alerts */}
      {(overdue.length > 0 || expiringSoon.length > 0) && (
        <div className="space-y-3">
          {overdue.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-400">Langganan Kedaluwarsa</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {overdue.map(t => (
                    <span key={t.id} className="text-xs bg-red-500/15 text-red-300 px-2 py-0.5 rounded-full">{t.business_name}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
          {expiringSoon.length > 0 && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-yellow-400">Segera Kedaluwarsa (7 Hari)</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {expiringSoon.map(t => (
                    <span key={t.id} className="text-xs bg-yellow-500/15 text-yellow-300 px-2 py-0.5 rounded-full">{t.business_name} — {new Date(t.subscription_end!).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Pending Payment Proofs */}
      {(() => {
        const pendingProofs = proofs.filter(p => p.status === 'pending')
        if (pendingProofs.length === 0) return null
        return (
          <div className="bg-gray-900 rounded-xl border border-indigo-500/30 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800 bg-indigo-500/5 flex items-center justify-between">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                Bukti Transfer Masuk
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">{pendingProofs.length}</span>
              </h2>
            </div>
            <div className="divide-y divide-gray-800/50">
              {pendingProofs.map(proof => (
                <div key={proof.id} className="px-6 py-4 flex items-start gap-4">
                  {/* Thumbnail */}
                  <button
                    onClick={() => setPreviewImage(proof.image_url)}
                    className="flex-shrink-0 group relative"
                  >
                    <img
                      src={proof.image_url}
                      alt="Bukti transfer"
                      className="w-20 h-20 rounded-lg object-cover border border-gray-700 group-hover:border-indigo-500 transition-colors"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ExternalLink className="w-4 h-4 text-white" />
                    </div>
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{proof.business_name}</p>
                    <p className="text-sm text-green-400 font-medium mt-0.5">
                      {proof.amount ? formatRupiah(Number(proof.amount)) : 'Nominal belum diisi'}
                    </p>
                    {proof.notes && <p className="text-xs text-gray-500 mt-0.5">{proof.notes}</p>}
                    <p className="text-xs text-gray-600 mt-1">
                      {new Date(proof.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleApproveProof(proof.id)}
                      disabled={processingProofId === proof.id}
                      className="flex items-center gap-1.5 h-8 px-3 bg-green-500/15 text-green-400 rounded-lg text-xs font-medium hover:bg-green-500/25 transition-colors disabled:opacity-50 border border-green-500/20"
                    >
                      {processingProofId === proof.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      Setujui
                    </button>
                    <button
                      onClick={() => handleRejectProof(proof.id)}
                      disabled={processingProofId === proof.id}
                      className="flex items-center gap-1.5 h-8 px-3 bg-red-500/15 text-red-400 rounded-lg text-xs font-medium hover:bg-red-500/25 transition-colors disabled:opacity-50 border border-red-500/20"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Tolak
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Payments Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="font-semibold text-white">Riwayat Pembayaran</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/30">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Klien</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Jumlah</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Tanggal Bayar</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Periode</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Catatan</th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-800/50">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-800 animate-pulse rounded w-20" /></td>
                  ))}
                </tr>
              )) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <DollarSign className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Belum ada catatan pembayaran</p>
                  </td>
                </tr>
              ) : payments.map(p => (
                <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors group">
                  <td className="px-4 py-3 text-white font-medium">{tenantMap[p.tenant_id] || p.tenant_id}</td>
                  <td className="px-4 py-3 text-green-400 font-medium">{formatRupiah(Number(p.amount))}</td>
                  <td className="px-4 py-3 text-gray-400 hidden md:table-cell">
                    {p.payment_date ? new Date(p.payment_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell">
                    {p.period_start && p.period_end
                      ? `${new Date(p.period_start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} — ${new Date(p.period_end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs hidden lg:table-cell max-w-[200px] truncate">{p.notes || '—'}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(p.id)}
                      disabled={deletingId === p.id}
                      className="p-1.5 rounded-md text-gray-600 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50"
                    >
                      {deletingId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                Catat Pembayaran
              </h3>
              <button onClick={() => setShowForm(false)} className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-gray-800 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Klien *</label>
                <select value={form.tenantId} onChange={e => setForm(f => ({ ...f, tenantId: e.target.value }))} required className="w-full h-9 px-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600">
                  <option value="">Pilih klien...</option>
                  {tenants.map(t => <option key={t.id} value={t.id}>{t.business_name} ({t.plan})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Jumlah (Rp) *</label>
                <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required placeholder="500000" className="w-full h-9 px-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Tanggal Bayar</label>
                <input type="date" value={form.paymentDate} onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))} className="w-full h-9 px-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Periode Mulai</label>
                  <input type="date" value={form.periodStart} onChange={e => setForm(f => ({ ...f, periodStart: e.target.value }))} className="w-full h-9 px-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Periode Akhir</label>
                  <input type="date" value={form.periodEnd} onChange={e => setForm(f => ({ ...f, periodEnd: e.target.value }))} className="w-full h-9 px-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Catatan</label>
                <input type="text" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Transfer BCA, dll." className="w-full h-9 px-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600" />
              </div>
              <button type="submit" disabled={submitting} className="w-full h-10 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {submitting ? 'Menyimpan...' : 'Simpan Pembayaran'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Overlay */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-2xl max-h-[80vh]">
            <button onClick={() => setPreviewImage(null)} className="absolute -top-3 -right-3 p-1.5 bg-gray-800 text-gray-400 hover:text-white rounded-full border border-gray-700 z-10">
              <X className="w-4 h-4" />
            </button>
            <img src={previewImage} alt="Preview bukti transfer" className="max-w-full max-h-[80vh] rounded-xl object-contain" />
          </div>
        </div>
      )}
    </div>
  )
}
