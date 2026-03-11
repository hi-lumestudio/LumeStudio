'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Wallet, Plus, Trash2, Loader2, Edit2, X } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface Cost {
  id: string
  tenant_id: string
  amount: number
  category: string
  description: string
  date: string
  created_at: string
}

const CATEGORIES = [
  'Software & Tools',
  'Pemasaran & Iklan',
  'Perlengkapan Kantor',
  'Gaji Pegawai',
  'Tagihan & Utilitas',
  'Server & Hosting',
  'Lainnya...'
]

export default function CostsPage() {
  const [costs, setCosts] = useState<Cost[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // Form State
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [customCategory, setCustomCategory] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  
  // Filter State
  const [monthFilter, setMonthFilter] = useState('all')

  // Edit State
  const [editingCost, setEditingCost] = useState<Cost | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editCategory, setEditCategory] = useState(CATEGORIES[0])
  const [editCustomCategory, setEditCustomCategory] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDate, setEditDate] = useState('')

  const fetchCosts = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const tenantId = user.user_metadata?.tenant_id || 'default'
    const { data, error } = await supabase
      .from('costs')
      .select('*')
      .eq('tenant_id', tenantId)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching costs, table might not exist yet:', error)
      toast.error('Gagal memuat data. Pastikan tabel costs sudah ada di Supabase.')
    } else {
      setCosts(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCosts()
  }, [])

  const handleAddCost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || isNaN(Number(amount))) {
      toast.error('Masukkan jumlah yang valid')
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const tenantId = user?.user_metadata?.tenant_id || 'default'

    const finalCategory = category === 'Lainnya...' ? customCategory : category

    const newCost = {
      tenant_id: tenantId,
      amount: Number(amount),
      category: finalCategory,
      description,
      date
    }

    const { error } = await supabase.from('costs').insert([newCost])

    setIsSubmitting(false)

    if (error) {
      toast.error(`Gagal menambahkan: ${error.message}`)
      console.error(error)
    } else {
      toast.success('Pengeluaran berhasil ditambahkan')
      setAmount('')
      setDescription('')
      setCustomCategory('')
      setCategory(CATEGORIES[0])
      // Refresh list
      fetchCosts()
    }
  }

  const handleEditClick = (cost: Cost) => {
    setEditingCost(cost)
    setEditAmount(cost.amount.toString())
    setEditDate(cost.date)
    setEditDescription(cost.description || '')
    
    if (CATEGORIES.includes(cost.category)) {
      setEditCategory(cost.category)
      setEditCustomCategory('')
    } else {
      setEditCategory('Lainnya...')
      setEditCustomCategory(cost.category)
    }
  }

  const handleUpdateCost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCost) return
    if (!editAmount || isNaN(Number(editAmount))) {
      toast.error('Masukkan jumlah yang valid')
      return
    }

    setIsSubmitting(true)
    const supabase = createClient()
    const finalCategory = editCategory === 'Lainnya...' ? editCustomCategory : editCategory

    const updates = {
      amount: Number(editAmount),
      category: finalCategory,
      description: editDescription,
      date: editDate
    }

    // Try to update using ID
    const { error } = await supabase
      .from('costs')
      .update(updates)
      .eq('id', editingCost.id)

    setIsSubmitting(false)

    if (error) {
      toast.error(`Gagal memperbarui: ${error.message}`)
      console.error(error)
    } else {
      toast.success('Pengeluaran berhasil diperbarui')
      setEditingCost(null)
      fetchCosts() // Refresh the list
    }
  }

  const handleDeleteCost = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengeluaran ini?')) return
    
    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('costs').delete().eq('id', id)

    if (error) {
      toast.error('Gagal menghapus pengeluaran')
    } else {
      toast.success('Pengeluaran dihapus')
      setCosts(prev => prev.filter(c => c.id !== id))
    }
    setDeletingId(null)
  }

  // Handle derived data for UI
  const filteredCosts = costs.filter(c => {
    if (monthFilter === 'all') return true
    return c.date.startsWith(monthFilter)
  })

  const totalFilteredAmount = filteredCosts.reduce((sum, cost) => sum + cost.amount, 0)

  // Generate unique months for the filter dropdown
  const uniqueMonths = Array.from(new Set(costs.map(c => c.date.substring(0, 7)))).sort().reverse()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengeluaran</h1>
        <p className="text-sm text-gray-500 mt-0.5">Catat dan kelola semua pengeluaran bisnis Anda</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ADD NEW COST FORM */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-gray-400" />
              Tambah Pengeluaran
            </h2>
            <form onSubmit={handleAddCost} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                  <input
                    type="number"
                    step="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent text-sm"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm bg-white"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {category === 'Lainnya...' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori Baru</label>
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm"
                    placeholder="Masukkan nama kategori"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none text-sm resize-none"
                  placeholder="Untuk apa pengeluaran ini?"
                />
              </div>

              <Button type="submit" className="w-full text-white" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wallet className="w-4 h-4 mr-2" />}
                Simpan Pengeluaran
              </Button>
            </form>
          </div>
        </div>

        {/* EXPENSES LIST */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="h-9 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white min-w-[140px]"
              >
                <option value="all">Semua Waktu</option>
                {uniqueMonths.map((m) => {
                  const [year, month] = m.split('-')
                  // Format in Indonesian locale
                  const dateObj = new Date(Number(year), Number(month) - 1)
                  const formatted = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
                  return <option key={m} value={m}>{formatted}</option>
                })}
              </select>
            </div>
            
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Total Pilihan</p>
              <p className="text-xl font-bold text-gray-900">Rp {totalFilteredAmount.toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Tanggal</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Detail</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Jumlah</th>
                    <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        {Array.from({ length: 4 }).map((_, j) => (
                          <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-100 animate-pulse rounded w-16" /></td>
                        ))}
                      </tr>
                    ))
                  ) : filteredCosts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-12 text-center">
                        <Wallet className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">
                          {monthFilter !== 'all' ? 'Belum ada pengeluaran di bulan ini.' : 'Belum ada pengeluaran yang dicatat.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredCosts.map((cost) => (
                      <tr key={cost.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors group">
                        <td className="px-4 py-3.5 whitespace-nowrap text-gray-500">
                          {new Date(cost.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-medium text-gray-900">{cost.category}</p>
                          {cost.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{cost.description}</p>}
                        </td>
                        <td className="px-4 py-3.5 text-right font-medium text-gray-900">
                          Rp {cost.amount.toLocaleString('id-ID')}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEditClick(cost)}
                              disabled={deletingId === cost.id}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                              title="Edit Pengeluaran"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCost(cost.id)}
                              disabled={deletingId === cost.id}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                              title="Hapus Pengeluaran"
                            >
                              {deletingId === cost.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>

      {/* EDIT MODAL */}
      {editingCost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Edit Pengeluaran</h2>
              <button onClick={() => setEditingCost(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateCost} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
                  <input
                    type="number"
                    step="1"
                    required
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm bg-white"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {editCategory === 'Lainnya...' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kategori Baru</label>
                  <input
                    type="text"
                    required
                    value={editCustomCategory}
                    onChange={(e) => setEditCustomCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                <textarea
                  rows={2}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <Button type="button" variant="outline" onClick={() => setEditingCost(null)} className="w-full">
                  Batal
                </Button>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
