'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database, Pencil, Check, X, Plus, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface DataEntry {
  id: string
  tenant_id: string
  key: string
  value: string
}

const DEFAULT_KEYS = [
  'Nama Usaha',
  'Jenis Produk',
  'Varian Produk',
  'Harga',
  'Bahan',
  'Ukuran',
  'Cara Order',
  'Waktu Produksi',
  'Pengiriman',
  'Metode Bayar',
  'Jam Operasional',
  'Lokasi',
  'Instagram',
  'Owner Phone',
  'Garansi',
  'Revisi Desain',
  'Info Tambahan',
]

export default function BusinessDataPage() {
  const [entries, setEntries] = useState<DataEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [tenantId, setTenantId] = useState('default')
  const [addingNew, setAddingNew] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [savingNew, setSavingNew] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const tid = user.user_metadata?.tenant_id || 'default'
      setTenantId(tid)
      const { data } = await supabase
        .from('business_data')
        .select('*')
        .eq('tenant_id', tid)
        .order('key', { ascending: true })

      // If tenant has no entries yet, seed the default placeholder keys
      if (!data || data.length === 0) {
        const rows = DEFAULT_KEYS.map((key) => ({ tenant_id: tid, key, value: '' }))
        const { data: seeded } = await supabase
          .from('business_data')
          .insert(rows)
          .select()
        setEntries(seeded || [])
      } else {
        setEntries(data)
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  const startEdit = (entry: DataEntry) => { setEditingId(entry.id); setEditValue(entry.value) }
  const cancelEdit = () => { setEditingId(null); setEditValue('') }

  const saveEdit = async (id: string) => {
    setSavingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('business_data').update({ value: editValue }).eq('id', id)
    if (error) { toast.error('Failed to save changes') } else {
      setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, value: editValue } : e)))
      toast.success('Knowledge updated')
      cancelEdit()
    }
    setSavingId(null)
  }

  const deleteEntry = async (id: string) => {
    if (!confirm('Delete this knowledge entry?')) return
    setDeletingId(id)
    const supabase = createClient()
    const { error } = await supabase.from('business_data').delete().eq('id', id)
    if (error) { toast.error('Failed to delete entry') } else {
      setEntries((prev) => prev.filter((e) => e.id !== id))
      toast.success('Entry deleted')
    }
    setDeletingId(null)
  }

  const addNewEntry = async () => {
    if (!newKey.trim() || !newValue.trim()) { toast.error('Key and value are required'); return }
    setSavingNew(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('business_data')
      .insert({ tenant_id: tenantId, key: newKey.trim(), value: newValue.trim() })
      .select().single()
    if (error) { toast.error('Failed to add entry') } else {
      setEntries((prev) => [...prev, data])
      setNewKey(''); setNewValue(''); setAddingNew(false)
      toast.success('Knowledge added')
    }
    setSavingNew(false)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Knowledge Base</h1>
          <p className="text-sm text-gray-500 mt-0.5">Key-value data used by the AI to answer customer questions</p>
        </div>
        <button
          onClick={() => { setAddingNew(true); setNewKey(''); setNewValue('') }}
          className="flex items-center gap-1.5 h-9 px-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Add entry
        </button>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide w-1/3">Key</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Value</th>
                <th className="px-4 py-3 w-24 text-xs font-medium text-gray-500 uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {addingNew && (
                <tr className="border-b border-green-100 bg-green-50">
                  <td className="px-4 py-3">
                    <input type="text" value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="e.g. business_hours" autoFocus
                      className="w-full h-8 px-2.5 rounded-md border border-green-300 text-sm focus:outline-none focus:ring-1 focus:ring-green-600 bg-white" />
                  </td>
                  <td className="px-4 py-3">
                    <input type="text" value={newValue} onChange={(e) => setNewValue(e.target.value)} placeholder="e.g. Senin–Jumat 09.00–18.00"
                      onKeyDown={(e) => { if (e.key === 'Enter') addNewEntry(); if (e.key === 'Escape') setAddingNew(false) }}
                      className="w-full h-8 px-2.5 rounded-md border border-green-300 text-sm focus:outline-none focus:ring-1 focus:ring-green-600 bg-white" />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={addNewEntry} disabled={savingNew} className="p-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                        {savingNew ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => setAddingNew(false)} className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50">
                  <td className="px-4 py-4"><div className="h-4 w-32 bg-gray-100 animate-pulse rounded" /></td>
                  <td className="px-4 py-4"><div className="h-4 w-48 bg-gray-100 animate-pulse rounded" /></td>
                  <td className="px-4 py-4" />
                </tr>
              )) : entries.length === 0 && !addingNew ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center">
                    <Database className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">No knowledge entries yet</p>
                    <p className="text-xs text-gray-400 mt-1">Click &quot;Add entry&quot; to add business information for the AI</p>
                  </td>
                </tr>
              ) : entries.map((entry) => (
                <tr key={entry.id} className="group border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 align-top pt-4">{entry.key}</td>
                  <td className="px-4 py-3 align-top">
                    {editingId === entry.id ? (
                      <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus rows={3}
                        onKeyDown={(e) => { if (e.key === 'Escape') cancelEdit() }}
                        className="w-full px-2.5 py-2 rounded-md border border-green-300 text-sm focus:outline-none focus:ring-1 focus:ring-green-600 resize-none" />
                    ) : (
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{entry.value}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right align-top pt-4">
                    {editingId === entry.id ? (
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => saveEdit(entry.id)} disabled={savingId === entry.id} className="p-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                          {savingId === entry.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={cancelEdit} className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(entry)} className="p-1.5 rounded-md text-gray-400 hover:text-green-600 hover:bg-green-50"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteEntry(entry.id)} disabled={deletingId === entry.id} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50">
                          {deletingId === entry.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && entries.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">{entries.length} knowledge entries</p>
          </div>
        )}
      </div>
    </div>
  )
}
