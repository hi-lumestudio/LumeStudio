'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, Users, ShoppingBag, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface Stats {
  totalCustomers: number
  totalOrders: number
  activeCustomers: number
  totalMessages: number
}

interface Order {
  id: string
  customer_phone: string
  order_summary: string
  order_time: string
  status: string
}

interface Conversation {
  customer_phone: string
  last_message: string
  last_contact: string
}

function getStatusStyle(status: string) {
  const s = status?.toLowerCase()
  if (s === 'completed') return 'bg-green-100 text-green-700'
  if (s === 'pending') return 'bg-yellow-100 text-yellow-700'
  if (s === 'processing') return 'bg-blue-100 text-blue-700'
  if (s === 'cancelled') return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-700'
}

function StatCard({ icon: Icon, label, value, color, loading }: {
  icon: React.ElementType; label: string; value: number; color: string; loading: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className={`p-2 rounded-lg ${color}`}><Icon className="w-5 h-5" /></div>
      </div>
      {loading ? <div className="h-8 w-16 bg-gray-100 animate-pulse rounded" /> : (
        <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
      )}
    </div>
  )
}

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats>({ totalCustomers: 0, totalOrders: 0, activeCustomers: 0, totalMessages: 0 })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const tenantId = user.user_metadata?.tenant_id || 'default'

      const [
        { count: totalCustomers },
        { count: totalOrders },
        { count: activeCustomers },
        { count: totalMessages },
        { data: orders },
        { data: conversations },
      ] = await Promise.all([
        supabase.from('crm').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('crm').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'active'),
        supabase.from('chat_history').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('orders').select('id, customer_phone, order_summary, order_time, status').eq('tenant_id', tenantId).order('order_time', { ascending: false }).limit(5),
        supabase.from('crm').select('customer_phone, last_message, last_contact').eq('tenant_id', tenantId).order('last_contact', { ascending: false }).limit(5),
      ])

      setStats({ totalCustomers: totalCustomers || 0, totalOrders: totalOrders || 0, activeCustomers: activeCustomers || 0, totalMessages: totalMessages || 0 })
      setRecentOrders(orders || [])
      setRecentConversations(conversations || [])
      setLoading(false)
    }
    fetchData()
  }, [])

  const statCards = [
    { icon: MessageSquare, label: 'Total Conversations', value: stats.totalMessages, color: 'bg-blue-50 text-blue-600' },
    { icon: Users, label: 'Total Customers', value: stats.totalCustomers, color: 'bg-purple-50 text-purple-600' },
    { icon: ShoppingBag, label: 'Total Orders', value: stats.totalOrders, color: 'bg-orange-50 text-orange-600' },
    { icon: TrendingUp, label: 'Active Customers', value: stats.activeCustomers, color: 'bg-green-50 text-green-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back. Here&apos;s what&apos;s happening.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => <StatCard key={card.label} {...card} loading={loading} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link href="/dashboard/orders" className="text-xs text-green-600 hover:text-green-700 font-medium">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-24 bg-gray-100 animate-pulse rounded" />
                  <div className="h-3 w-48 bg-gray-100 animate-pulse rounded" />
                </div>
                <div className="h-5 w-16 bg-gray-100 animate-pulse rounded-full" />
              </div>
            )) : recentOrders.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No orders yet</p>
              </div>
            ) : recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{order.customer_phone}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{order.order_summary}</p>
                  {order.order_time && (
                    <p className="text-xs text-gray-400 mt-0.5">{formatDistanceToNow(new Date(order.order_time), { addSuffix: true })}</p>
                  )}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize flex-shrink-0 ${getStatusStyle(order.status)}`}>{order.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Conversations</h2>
            <Link href="/dashboard/conversations" className="text-xs text-green-600 hover:text-green-700 font-medium">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {loading ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-24 bg-gray-100 animate-pulse rounded" />
                  <div className="h-3 w-40 bg-gray-100 animate-pulse rounded" />
                </div>
              </div>
            )) : recentConversations.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No conversations yet</p>
              </div>
            ) : recentConversations.map((conv) => (
              <Link key={conv.customer_phone} href="/dashboard/conversations" className="px-6 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors block">
                <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {conv.customer_phone?.slice(-2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{conv.customer_phone}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{conv.last_message}</p>
                  {conv.last_contact && (
                    <p className="text-xs text-gray-400 mt-0.5">{formatDistanceToNow(new Date(conv.last_contact), { addSuffix: true })}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
