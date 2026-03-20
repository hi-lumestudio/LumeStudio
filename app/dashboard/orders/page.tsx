'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShoppingBag, Loader2, CheckSquare } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

interface Order {
  id: string
  tenant_id: string
  customer_phone: string
  order_summary: string
  order_time: string
  status: string
}

const ORDER_STATUSES = ['waiting payment', 'payment confirmed', 'processing', 'shipped', 'completed', 'cancelled']

function getStatusStyle(status: string) {
  const s = status?.toLowerCase()
  if (s === 'completed') return 'bg-green-100 text-green-700'
  if (s === 'waiting payment' || s === 'pending') return 'bg-yellow-100 text-yellow-700'
  if (s === 'payment confirmed') return 'bg-purple-100 text-purple-700'
  if (s === 'processing') return 'bg-blue-100 text-blue-700'
  if (s === 'shipped') return 'bg-indigo-100 text-indigo-700'
  if (s === 'cancelled') return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-700'
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—'
  try { return format(new Date(dateStr), 'MMM d, yyyy h:mm a') } catch { return dateStr }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [customerNames, setCustomerNames] = useState<Record<string, string | null>>({})

  // Batch Actions State
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([])
  const [batchStatusValue, setBatchStatusValue] = useState('')
  const [isBatchUpdating, setIsBatchUpdating] = useState(false)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('orders_v2')
        .select('*')
        .eq('tenant_id', user.id)
        .order('created_at', { ascending: false })

      // Fetch customer names
      const { data: customers } = await supabase
        .from('customers')
        .select('phone, name')
        .eq('tenant_id', user.id)

      const nameMap: Record<string, string | null> = {}
        ; (customers || []).forEach((c: any) => { if (c.phone) nameMap[c.phone] = c.name })
      setCustomerNames(nameMap)

      setOrders(data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    const supabase = createClient()
    const { error } = await supabase.from('orders_v2').update({ status: newStatus }).eq('id', orderId)

    if (error) {
      toast.error('Failed to update order status')
    } else {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
      toast.success('Order status updated')
    }
    setUpdatingId(null)
  }

  // --- Batch Actions Helpers ---
  const toggleSelection = (id: string) => {
    setSelectedOrderIds(prev =>
      prev.includes(id) ? prev.filter(orderId => orderId !== id) : [...prev, id]
    )
  }

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      // Select all visible (filtered) items
      setSelectedOrderIds(filtered.map(o => o.id))
    } else {
      setSelectedOrderIds([])
    }
  }

  const handleBatchUpdate = async () => {
    if (!batchStatusValue) {
      toast.error('Please select a new status')
      return
    }

    setIsBatchUpdating(true)
    const supabase = createClient()

    // Supabase '.in' filter makes it easy to update multiple records at once
    const { error } = await supabase
      .from('orders_v2')
      .update({ status: batchStatusValue })
      .in('id', selectedOrderIds)

    if (error) {
      toast.error('Failed to manually update order statuses')
    } else {
      setOrders(prev => prev.map(o =>
        selectedOrderIds.includes(o.id) ? { ...o, status: batchStatusValue } : o
      ))
      toast.success(`Successfully updated ${selectedOrderIds.length} orders to ${batchStatusValue}`)
      setSelectedOrderIds([]) // Clear selection on success
      setBatchStatusValue('') // Reset dropdown
    }
    setIsBatchUpdating(false)
  }

  const filtered = orders.filter((o) => {
    if (statusFilter === 'all') return true
    const normalizedStatus = o.status?.toLowerCase() === 'pending' ? 'waiting payment' : o.status?.toLowerCase()
    return normalizedStatus === statusFilter
  })
  const isAllSelected = filtered.length > 0 && selectedOrderIds.length === filtered.length

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track and manage customer orders</p>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value)
            setSelectedOrderIds([]) // Clear selections when filtering changes
          }}
          className="h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white"
        >
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        {!loading && (
          <span className="text-sm text-gray-500">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* BATCH ACTION BAR */}
      {selectedOrderIds.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-2 text-green-800 font-medium text-sm">
            <CheckSquare className="w-4 h-4" />
            <span>{selectedOrderIds.length} orders selected</span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={batchStatusValue}
              onChange={(e) => setBatchStatusValue(e.target.value)}
              disabled={isBatchUpdating}
              className="h-9 px-3 rounded-md border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 bg-white min-w-[140px]"
            >
              <option value="" disabled>Change status to...</option>
              {ORDER_STATUSES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <Button
              size="sm"
              onClick={handleBatchUpdate}
              disabled={isBatchUpdating || !batchStatusValue}
              className="whitespace-nowrap"
            >
              {isBatchUpdating && <Loader2 className="mr-2 w-3 h-3 animate-spin" />}
              Update Orders
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedOrderIds([])}
              disabled={isBatchUpdating}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-4 py-3 w-12 text-center text-xs font-medium text-gray-500">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-green-600 focus:ring-green-600 cursor-pointer w-4 h-4"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    disabled={loading || filtered.length === 0}
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Customer</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden md:table-cell">Order Summary</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide hidden lg:table-cell">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-4 py-4"><div className="h-4 bg-gray-100 animate-pulse rounded w-4 mx-auto" /></td>
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-100 animate-pulse rounded w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center">
                    <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">
                      {statusFilter !== 'all' ? `No ${statusFilter} orders` : 'No orders yet'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr
                    key={order.id}
                    className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${selectedOrderIds.includes(order.id) ? 'bg-green-50/50 hover:bg-green-50' : ''}`}
                  >
                    <td className="px-4 py-3.5 text-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-green-600 focus:ring-green-600 cursor-pointer w-4 h-4"
                        checked={selectedOrderIds.includes(order.id)}
                        onChange={() => toggleSelection(order.id)}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-gray-900">{customerNames[order.customer_phone] || order.customer_phone || '—'}</p>
                      {customerNames[order.customer_phone] && (
                        <p className="text-xs text-gray-400">{order.customer_phone}</p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 hidden md:table-cell max-w-xs">
                      <p className="line-clamp-2">{order.order_summary || '—'}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 hidden lg:table-cell whitespace-nowrap">
                      {formatDate(order.order_time)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="relative inline-flex items-center">
                        <select
                          value={order.status?.toLowerCase() === 'pending' ? 'waiting payment' : (order.status || '')}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={updatingId === order.id}
                          className={`text-xs h-7 pl-3 pr-8 rounded-full font-medium capitalize appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50 border border-gray-100 ${getStatusStyle(order.status)}`}
                        >
                          <option value="" disabled>Select status</option>
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                        {updatingId === order.id ? (
                          <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin opacity-70" />
                        ) : (
                          <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
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
  )
}

