'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ShoppingBag, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

interface Order {
  id: string
  tenant_id: string
  customer_phone: string
  order_summary: string
  order_time: string
  status: string
}

const ORDER_STATUSES = ['pending', 'confirmed', 'processing', 'completed', 'cancelled']

function getStatusStyle(status: string) {
  const s = status?.toLowerCase()
  if (s === 'completed') return 'bg-green-100 text-green-700'
  if (s === 'pending') return 'bg-yellow-100 text-yellow-700'
  if (s === 'confirmed') return 'bg-purple-100 text-purple-700'
  if (s === 'processing') return 'bg-blue-100 text-blue-700'
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

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const tenantId = user.user_metadata?.tenant_id || 'default'
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('order_time', { ascending: false })

      setOrders(data || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId)
    const supabase = createClient()
    const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)

    if (error) {
      toast.error('Gagal mengupdate status pesanan')
    } else {
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)))
      toast.success('Status pesanan diperbarui')
    }
    setUpdatingId(null)
  }

  const filtered = orders.filter((o) => statusFilter === 'all' || o.status?.toLowerCase() === statusFilter)

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track and manage customer orders</p>
      </div>

      <div className="flex items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
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

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
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
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-4 py-4"><div className="h-4 bg-gray-100 animate-pulse rounded w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center">
                    <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">
                      {statusFilter !== 'all' ? `No ${statusFilter} orders` : 'No orders yet'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <p className="font-medium text-gray-900">{order.customer_phone || '—'}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 hidden md:table-cell max-w-xs">
                      <p className="line-clamp-2">{order.order_summary || '—'}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 hidden lg:table-cell whitespace-nowrap">
                      {formatDate(order.order_time)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getStatusStyle(order.status)}`}>
                          {order.status || 'unknown'}
                        </span>
                        <div className="relative">
                          <select
                            value={order.status || ''}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            disabled={updatingId === order.id}
                            className="text-xs h-7 pl-2 pr-6 rounded-md border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-green-600 disabled:opacity-50 cursor-pointer appearance-none"
                          >
                            <option value="" disabled>Change...</option>
                            {ORDER_STATUSES.map((s) => (
                              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                          {updatingId === order.id && (
                            <Loader2 className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 animate-spin text-gray-400" />
                          )}
                        </div>
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

