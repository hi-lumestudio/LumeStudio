'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database, Pencil, Check, X, Plus, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface DataEntry {
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
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [deletingKey, setDeletingKey] = useState<string | null>(null)
  const [addingNew, setAddingNew] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [savingNew, setSavingNew] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data: tenant } = await supabase
        .from('tenants')
        .select('knowledge_base')
        .eq('id', user.id)
        .single()

      const kb = tenant?.knowledge_base || {}

      // If tenant has no knowledge base yet, seed with default keys
      if (Object.keys(kb).length === 0) {
        const defaultKb: Record<string, string> = {}
        DEFAULT_KEYS.forEach(key => { defaultKb[key] = '' })

        await supabase
          .from('tenants')
          .update({ knowledge_base: defaultKb })
          .eq('id', user.id)

        setEntries(Object.entries(defaultKb).map(([key, value]) => ({ key, value })))
      } else {
        setEntries(Object.entries(kb).map(([key, value]) => ({ key, value: value as string })))
      }

      setLoading(false)
    }
    fetchData()
  }, [])

  const startEdit = (entry: DataEntry) => { setEditingKey(entry.key); setEditValue(entry.value) }
  const cancelEdit = () => { setEditingKey(null); setEditValue('') }

  const saveEdit = async (key: string) => {
    if (!userId) return
    setSavingKey(key)
    const supabase = createClient()

    // Build updated knowledge_base with this key changed
    const currentKb: Record<string, string> = {}
    entries.forEach(e => { currentKb[e.key] = e.key === key ? editValue : e.value })

    const { error } = await supabase
      .from('tenants')
      .update({ knowledge_base: currentKb })
      .eq('id', userId)

    if (error) { toast.error('Failed to save changes') } else {
      setEntries(prev => prev.map(e => e.key === key ? { ...e, value: editValue } : e))
      toast.success('Knowledge updated')
      cancelEdit()
    }
    setSavingKey(null)
  }

  const deleteEntry = async (key: string) => {
    if (!confirm('Delete this knowledge entry?') || !userId) return
    setDeletingKey(key)
    const supabase = createClient()

    const currentKb: Record<string, string> = {}
    entries.forEach(e => { if (e.key !== key) currentKb[e.key] = e.value })

    const { error } = await supabase
      .from('tenants')
      .update({ knowledge_base: currentKb })
      .eq('id', userId)

    if (error) { toast.error('Failed to delete entry') } else {
      setEntries(prev => prev.filter(e => e.key !== key))
      toast.success('Entry deleted')
    }
    setDeletingKey(null)
  }

  const addNewEntry = async () => {
    if (!newKey.trim() || !newValue.trim()) { toast.error('Key and value are required'); return }
    if (!userId) return
    if (entries.some(e => e.key === newKey.trim())) { toast.error('Key already exists'); return }

    setSavingNew(true)
    const supabase = createClient()

    const currentKb: Record<string, string> = {}
    entries.forEach(e => { currentKb[e.key] = e.value })
    currentKb[newKey.trim()] = newValue.trim()

    const { error } = await supabase
      .from('tenants')
      .update({ knowledge_base: currentKb })
      .eq('id', userId)

    if (error) { toast.error('Failed to add entry') } else {
      setEntries(prev => [...prev, { key: newKey.trim(), value: newValue.trim() }])
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
                <tr key={entry.key} className="group border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600 align-top pt-4">{entry.key}</td>
                  <td className="px-4 py-3 align-top">
                    {editingKey === entry.key ? (
                      <textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} autoFocus rows={3}
                        onKeyDown={(e) => { if (e.key === 'Escape') cancelEdit() }}
                        className="w-full px-2.5 py-2 rounded-md border border-green-300 text-sm focus:outline-none focus:ring-1 focus:ring-green-600 resize-none" />
                    ) : (
                      <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{entry.value}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right align-top pt-4">
                    {editingKey === entry.key ? (
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => saveEdit(entry.key)} disabled={savingKey === entry.key} className="p-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                          {savingKey === entry.key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={cancelEdit} className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(entry)} className="p-1.5 rounded-md text-gray-400 hover:text-green-600 hover:bg-green-50"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => deleteEntry(entry.key)} disabled={deletingKey === entry.key} className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-50">
                          {deletingKey === entry.key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
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
