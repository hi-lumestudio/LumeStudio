'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, KeyRound, Loader2, Check, CreditCard, X, Copy, Megaphone, Upload, ImageIcon, Clock, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'

interface UserInfo {
  email: string
  tenantId: string
  tenantName: string
  createdAt: string
  subscriptionPlan: string
  aiResponseCount: number
  aiLimit: number | null
  subscriptionEndDate: string | null
}

export default function SettingsPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  // Password change state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  // Payment Modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // Payment proof upload state
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [proofAmount, setProofAmount] = useState('')
  const [proofNotes, setProofNotes] = useState('')
  const [uploading, setUploading] = useState(false)
  const [proofHistory, setProofHistory] = useState<any[]>([])
  const [loadingProofs, setLoadingProofs] = useState(false)

  // Watermark toggle state
  const [showWatermark, setShowWatermark] = useState(true)
  const [togglingWatermark, setTogglingWatermark] = useState(false)
  const [tenantPlan, setTenantPlan] = useState('starter')

  const fetchProofHistory = async () => {
    setLoadingProofs(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('payment_proofs')
      .select('id, image_url, amount, notes, status, admin_notes, created_at')
      .order('created_at', { ascending: false })
      .limit(10)
    setProofHistory(data || [])
    setLoadingProofs(false)
  }

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Fetch tenant info from new tenants table
        const { data: tenant } = await supabase
          .from('tenants')
          .select('business_name, plan, ai_limit, subscription_end, status, show_watermark')
          .eq('id', user.id)
          .single()


        // Fetch current month usage from monthly_usage
        const currentMonth = new Date().toISOString().slice(0, 7) + '-01' // e.g. '2026-03-01'
        const { data: usage } = await supabase
          .from('monthly_usage')
          .select('ai_responses')
          .eq('tenant_id', user.id)
          .eq('month', currentMonth)
          .single()

        setUserInfo({
          email: user.email || '',
          tenantId: user.id,
          tenantName: tenant?.business_name || user.user_metadata?.tenant_name || 'My Business',
          createdAt: user.created_at,
          subscriptionPlan: tenant?.plan || 'trial',
          aiResponseCount: usage?.ai_responses || 0,
          aiLimit: tenant?.ai_limit || null,
          subscriptionEndDate: tenant?.subscription_end || null,
        })
        setShowWatermark(tenant?.show_watermark !== false)
        setTenantPlan(tenant?.plan || 'starter')

        // Fetch proof history
        fetchProofHistory()
      }
      setLoading(false)
    }

    fetchUser()
  }, [])

  const handleUploadProof = async () => {
    if (!proofFile || !userInfo) return
    setUploading(true)
    const supabase = createClient()

    // Upload image to Supabase Storage
    const fileExt = proofFile.name.split('.').pop()
    const fileName = `${userInfo.tenantId}/${Date.now()}.${fileExt}`

    const { error: uploadErr } = await supabase.storage
      .from('payment-proofs')
      .upload(fileName, proofFile, { cacheControl: '3600', upsert: false })

    if (uploadErr) {
      toast.error('Gagal mengunggah gambar: ' + uploadErr.message)
      setUploading(false)
      return
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('payment-proofs').getPublicUrl(fileName)

    // Insert proof record
    const { error: insertErr } = await supabase.from('payment_proofs').insert({
      tenant_id: userInfo.tenantId,
      image_url: urlData.publicUrl,
      amount: proofAmount ? parseInt(proofAmount) : null,
      notes: proofNotes || null,
    })

    if (insertErr) {
      toast.error('Gagal menyimpan bukti: ' + insertErr.message)
    } else {
      toast.success('Bukti transfer berhasil dikirim! Menunggu verifikasi admin.')
      setProofFile(null)
      setProofAmount('')
      setProofNotes('')
      fetchProofHistory()
    }
    setUploading(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setChangingPassword(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      toast.error(error.message || 'Failed to change password')
    } else {
      toast.success('Password changed successfully')
      setNewPassword('')
      setConfirmPassword('')
    }
    setChangingPassword(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
          <User className="w-5 h-5 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Account Information</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoField label="Email address" value={userInfo?.email || '—'} />
            <InfoField label="Business Name" value={userInfo?.tenantName || '—'} />
            <InfoField
              label="Account created"
              value={
                userInfo?.createdAt
                  ? new Date(userInfo.createdAt).toLocaleDateString('en-MY', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                  : '—'
              }
            />

            <div className="col-span-1 sm:col-span-2 p-4 bg-green-50 border border-green-100 rounded-xl mb-1 mt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-green-800 uppercase tracking-wide mb-1">Subscription Plan</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-xl font-bold text-green-900">{userInfo?.subscriptionPlan ? (userInfo.subscriptionPlan.charAt(0).toUpperCase() + userInfo.subscriptionPlan.slice(1)) : 'Free / Trial'}</p>
                  {userInfo?.subscriptionEndDate && (
                    <span className="text-xs font-medium text-green-700 bg-green-100/60 px-2.5 py-0.5 rounded-full border border-green-200">
                      Berakhir {new Date(userInfo.subscriptionEndDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(true)}
                className="flex items-center justify-center gap-2 h-9 px-4 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm whitespace-nowrap"
              >
                <CreditCard className="w-4 h-4" />
                Upgrade / Perpanjang
              </button>
            </div>

            <div className="col-span-1 sm:col-span-2 mt-2">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">AI Responses / Limit</p>
                <span className="text-sm font-medium text-gray-900">
                  {userInfo?.aiResponseCount?.toString() || '0'} / {userInfo?.aiLimit ? userInfo.aiLimit.toLocaleString('id-ID') : 'Unlimited'}
                </span>
              </div>
              {userInfo?.aiLimit ? (
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full ${(userInfo.aiResponseCount / userInfo.aiLimit) >= 0.9 ? 'bg-red-500' :
                      (userInfo.aiResponseCount / userInfo.aiLimit) >= 0.75 ? 'bg-yellow-400' : 'bg-green-500'
                      }`}
                    style={{ width: `${Math.min((userInfo.aiResponseCount / userInfo.aiLimit) * 100, 100)}%` }}
                  ></div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Watermark Toggle */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
          <Megaphone className="w-5 h-5 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Watermark</h2>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-1">Watermark &quot;Powered by lumestudio.my.id&quot;</p>
              {tenantPlan === 'pro' ? (
                <p className="text-xs text-gray-500">Tampilkan atau sembunyikan watermark di setiap pesan AI.</p>
              ) : (
                <p className="text-xs text-gray-500">Setiap pesan AI akan menampilkan &quot;Powered by lumestudio.my.id&quot;. Upgrade ke Pro untuk menghilangkan watermark.</p>
              )}
            </div>
            <button
              onClick={async () => {
                if (tenantPlan !== 'pro') return
                setTogglingWatermark(true)
                const newVal = !showWatermark
                const supabase = createClient()
                const { error } = await supabase.from('tenants').update({ show_watermark: newVal }).eq('id', userInfo?.tenantId)
                if (error) { toast.error('Gagal mengubah pengaturan watermark'); setTogglingWatermark(false); return }
                setShowWatermark(newVal)
                toast.success(newVal ? 'Watermark diaktifkan' : 'Watermark dinonaktifkan')
                setTogglingWatermark(false)
              }}
              disabled={tenantPlan !== 'pro' || togglingWatermark}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${tenantPlan !== 'pro' ? 'bg-green-500 opacity-50 cursor-not-allowed' :
                  showWatermark ? 'bg-green-500 cursor-pointer' : 'bg-gray-300 cursor-pointer'
                }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${showWatermark ? 'translate-x-6' : 'translate-x-1'
                }`} />
            </button>
          </div>
          {tenantPlan !== 'pro' && (
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 h-9 px-4 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <CreditCard className="w-4 h-4" />
              Upgrade ke Pro
            </button>
          )}
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
          <KeyRound className="w-5 h-5 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Change Password</h2>
        </div>
        <form onSubmit={handleChangePassword} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              minLength={6}
              required
              autoComplete="new-password"
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              minLength={6}
              required
              autoComplete="new-password"
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
          </div>
          <div className="pt-1">
            <button
              type="submit"
              disabled={changingPassword || !newPassword || !confirmPassword}
              className="flex items-center gap-2 h-10 px-5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {changingPassword ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {changingPassword ? 'Saving...' : 'Save new password'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger zone note */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 px-6 py-4">
        <p className="text-sm text-gray-500">
          Need to add more users or change tenant settings? Contact your Lume Studio administrator.
        </p>
      </div>

      {/* Payment Modal Overlay */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                Transfer Pembayaran
              </h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-5 overflow-y-auto">
              {/* Bank Details */}
              <div className="text-center space-y-1">
                <p className="text-sm text-gray-500">Silakan transfer nominal paket yang dipilih ke rekening BCA di bawah ini:</p>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 relative overflow-hidden text-center sm:text-left">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4 pointer-events-none"></div>
                <div className="relative z-10">
                  <p className="text-xs font-bold tracking-wider text-blue-800 uppercase mb-1">Bank Central Asia</p>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2">
                    <p className="text-2xl font-black text-blue-950 tracking-widest font-mono">8630111197</p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText('8630111197')
                        toast.success('Nomor rekening disalin!')
                      }}
                      className="inline-flex items-center justify-center p-2 text-blue-600 bg-blue-100/50 hover:bg-blue-100 rounded-md transition-colors mx-auto sm:mx-0"
                      title="Salin rekening"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-blue-800/80 mt-2">a.n <span className="text-blue-900 font-bold">Guildy Harvey</span></p>
                </div>
              </div>

              {/* Upload Proof */}
              <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-green-600" />
                  Upload Bukti Transfer
                </p>

                {/* File picker */}
                <label className="block cursor-pointer">
                  <div className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                    proofFile ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}>
                    {proofFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <ImageIcon className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-green-700 font-medium">{proofFile.name}</span>
                        <button
                          type="button"
                          onClick={(e) => { e.preventDefault(); setProofFile(null) }}
                          className="p-0.5 text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                        <p className="text-sm text-gray-500">Klik untuk pilih gambar</p>
                        <p className="text-xs text-gray-400">JPG, PNG, WebP (maks 5MB)</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f && f.size > 5 * 1024 * 1024) {
                        toast.error('Ukuran file maksimal 5MB')
                        return
                      }
                      setProofFile(f || null)
                    }}
                  />
                </label>

                {/* Amount + notes */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Nominal (Rp)</label>
                    <input
                      type="number"
                      value={proofAmount}
                      onChange={e => setProofAmount(e.target.value)}
                      placeholder="500000"
                      className="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Catatan</label>
                    <input
                      type="text"
                      value={proofNotes}
                      onChange={e => setProofNotes(e.target.value)}
                      placeholder="Bln Maret"
                      className="w-full h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
                    />
                  </div>
                </div>

                <button
                  onClick={handleUploadProof}
                  disabled={!proofFile || uploading}
                  className="w-full h-10 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Mengunggah...' : 'Kirim Bukti Transfer'}
                </button>
              </div>

              {/* Proof History */}
              {proofHistory.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Riwayat Upload</p>
                  {proofHistory.map((p: any) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <a href={p.image_url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
                        <img src={p.image_url} alt="Bukti" className="w-12 h-12 rounded-md object-cover border border-gray-200" />
                      </a>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">
                          {p.amount ? `Rp ${Number(p.amount).toLocaleString('id-ID')}` : 'Belum ada nominal'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {p.status === 'pending' && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                            <Clock className="w-3 h-3" /> Menunggu
                          </span>
                        )}
                        {p.status === 'approved' && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Disetujui
                          </span>
                        )}
                        {p.status === 'rejected' && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-1 rounded-full">
                            <XCircle className="w-3 h-3" /> Ditolak
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-full h-10 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoField({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-sm text-gray-900 ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  )
}
