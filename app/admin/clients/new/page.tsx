'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check, Copy, RefreshCw, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { createNewClient } from '@/app/admin/actions'

const UNIVERSAL_TEMPLATE = `INSTRUKSI UTAMA: Bahasa Indonesia only.

Kamu adalah admin WhatsApp untuk [NAMA_BISNIS].
Gaya bicara: ramah, profesional, menggunakan "kak" untuk menyapa customer.

=== FORMAT PESAN ===
Wajib pakai <BR> untuk line break di pesan biasa.
Untuk Fix Order, pakai | sebagai line break.

=== ALUR PERCAKAPAN ===
STEP 1 — Sapaan + info produk
STEP 2 — Form order (nama, alamat, produk, jumlah)
STEP 3 — Fix Order (dengan REVENUE tag)
STEP 4 — Customer bilang sudah transfer → minta kirim foto bukti
STEP 5 — Tidak ada bukti → admin akan bantu

=== ATURAN NAMA CUSTOMER ===
Tambahkan CUSTOMER_NAME:nama di akhir pesan jika kamu tahu nama customer.

=== LARANGAN ===
- Jangan jawab di luar topik bisnis
- Jangan kasih rekening sebelum form lengkap
- Jangan tulis REVENUE kalau bukan Fix Order
- Jangan pakai []
- Jangan lupa | untuk line break di Fix Order`

function generatePassword(length = 12) {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let pass = ''
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pass
}

export default function NewClientPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ email: string; password: string; businessName: string } | null>(null)

  const [form, setForm] = useState({
    businessName: '',
    email: '',
    password: generatePassword(),
    ownerPhone: '',
    plan: 'starter' as 'starter' | 'pro',
    wahaSession: 'default',
    openrouterApiKey: '',
    aiPrompt: UNIVERSAL_TEMPLATE,
    knowledgeBase: '{}',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.businessName.trim() || !form.email.trim() || !form.password.trim() || !form.ownerPhone.trim()) {
      toast.error('Semua field wajib harus diisi')
      return
    }

    setSubmitting(true)
    const result = await createNewClient(form)

    if (result.success) {
      setSuccess({
        email: result.email!,
        password: result.password!,
        businessName: result.businessName!,
      })
      toast.success('Klien baru berhasil dibuat!')
    } else {
      toast.error(result.error || 'Gagal membuat klien')
    }
    setSubmitting(false)
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
            <Check className="w-6 h-6 text-green-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Klien Berhasil Dibuat!</h2>
          <p className="text-sm text-gray-400">{success.businessName}</p>
        </div>

        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
          <h3 className="font-semibold text-white text-sm">Kredensial Login</h3>
          <div className="space-y-3">
            <CredentialField label="Email" value={success.email} />
            <CredentialField label="Password" value={success.password} />
          </div>
          <p className="text-xs text-gray-500">Kirim kredensial ini ke klien untuk login ke dashboard.</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => { setSuccess(null); setForm(f => ({ ...f, businessName: '', email: '', password: generatePassword(), ownerPhone: '', knowledgeBase: '{}' })) }}
            className="flex-1 h-10 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            + Buat Klien Lain
          </button>
          <button
            onClick={() => router.push('/admin/clients')}
            className="flex-1 h-10 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Lihat Semua Klien
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/admin/clients')} className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Onboarding Klien Baru</h1>
          <p className="text-sm text-gray-400 mt-0.5">Buat akun auth + tenant row dalam satu langkah</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Section title="Informasi Dasar">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Nama Bisnis *" value={form.businessName} onChange={v => setForm(f => ({ ...f, businessName: v }))} placeholder="Contoh: Toko Kue Makmur" />
            <FormField label="Email Login *" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} type="email" placeholder="klien@email.com" />
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Password *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="flex-1 h-9 px-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, password: generatePassword() }))}
                  className="p-2 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-800 border border-gray-700 transition-colors"
                  title="Generate"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <FormField label="Owner Phone *" value={form.ownerPhone} onChange={v => setForm(f => ({ ...f, ownerPhone: v }))} placeholder="628xxxxxxxxxx" />
          </div>
        </Section>

        {/* Config */}
        <Section title="Konfigurasi">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Plan</label>
              <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value as 'starter' | 'pro' }))} className="w-full h-9 px-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600">
                <option value="starter">Starter (Rp 500K/bln — 7.500 AI)</option>
                <option value="pro">Pro (Rp 1M/bln — 20.000 AI)</option>
              </select>
            </div>
            <FormField label="WAHA Session" value={form.wahaSession} onChange={v => setForm(f => ({ ...f, wahaSession: v }))} placeholder="default" />
            <div className="sm:col-span-2">
              <FormField label="OpenRouter API Key (opsional)" value={form.openrouterApiKey} onChange={v => setForm(f => ({ ...f, openrouterApiKey: v }))} placeholder="sk-or-v1-xxx (kosongkan untuk pakai shared key)" />
            </div>
          </div>
        </Section>

        {/* AI Prompt */}
        <Section title="AI Prompt (System)">
          <textarea
            value={form.aiPrompt}
            onChange={e => setForm(f => ({ ...f, aiPrompt: e.target.value }))}
            rows={14}
            className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-y leading-relaxed"
            placeholder="System prompt untuk AI..."
          />
          <p className="text-xs text-gray-600 mt-1">Template universal sudah diisi. Sesuaikan dengan bisnis klien.</p>
        </Section>

        {/* Knowledge Base */}
        <Section title="Knowledge Base (JSON)">
          <textarea
            value={form.knowledgeBase}
            onChange={e => setForm(f => ({ ...f, knowledgeBase: e.target.value }))}
            rows={6}
            className="w-full px-4 py-3 rounded-lg border border-gray-700 bg-gray-800 text-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-y leading-relaxed"
            placeholder='{"Nama Usaha": "...", "Produk": "..."}'
          />
        </Section>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full h-11 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          {submitting ? 'Membuat klien...' : 'Buat Klien Baru'}
        </button>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
      <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-400">{title}</h2>
      {children}
    </div>
  )
}

function FormField({ label, value, onChange, type = 'text', placeholder = '' }: {
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

function CredentialField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-gray-800 rounded-lg px-4 py-3">
      <div>
        <p className="text-xs text-gray-500 mb-0.5">{label}</p>
        <p className="text-sm text-white font-mono">{value}</p>
      </div>
      <button
        onClick={() => { navigator.clipboard.writeText(value); toast.success(`${label} disalin!`) }}
        className="p-1.5 rounded-md text-gray-500 hover:text-gray-300 hover:bg-gray-700 transition-colors"
      >
        <Copy className="w-4 h-4" />
      </button>
    </div>
  )
}
