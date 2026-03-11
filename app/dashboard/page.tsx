'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, Users, ShoppingBag, TrendingUp, DollarSign, Wallet } from 'lucide-react'
import { formatDistanceToNow, format, subDays, isSameDay } from 'date-fns'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

interface Stats {
  totalCustomers: number
  totalOrders: number
  activeCustomers: number
  totalMessages: number
  totalRevenue: number
  totalCosts: number
}

interface Order {
  id: string
  customer_phone: string
  order_summary: string
  revenue?: number
  order_time: string
  status: string
}

interface Cost {
  id: string
  amount: number
  date: string
}

interface Conversation {
  customer_phone: string
  last_message: string
  last_contact: string
}

function getStatusStyle(status: string) {
  const s = status?.toLowerCase()
  if (s === 'completed') return 'bg-green-100 text-green-700'
  if (s === 'shipped') return 'bg-indigo-100 text-indigo-700'
  if (s === 'payment confirmed') return 'bg-purple-100 text-purple-700'
  if (s === 'pending') return 'bg-yellow-100 text-yellow-700'
  if (s === 'processing') return 'bg-blue-100 text-blue-700'
  if (s === 'cancelled') return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-700'
}

function StatCard({ icon: Icon, label, value, color, loading, isCurrency = false }: {
  icon: React.ElementType; label: string; value: number; color: string; loading: boolean; isCurrency?: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className={`p-2 rounded-lg ${color}`}><Icon className="w-5 h-5" /></div>
      </div>
      {loading ? <div className="h-8 w-16 bg-gray-100 animate-pulse rounded" /> : (
        <p className="text-3xl font-bold text-gray-900">
          {isCurrency ? 'Rp ' : ''}{value.toLocaleString('id-ID')}
        </p>
      )}
    </div>
  )
}

// Extract number from string if no strict amount is provided as a fallback
function extractAmount(str: string): number {
  if (!str) return 0
  // Match Rp followed by digits and dots (e.g. Rp 1.200.000 or 1200000)
  const match = str.match(/(?:Rp|\$)?\s*(\d+(?:[.,]\d{3})*)/)
  return match ? parseInt(match[1].replace(/[.,]/g, ''), 10) : 0
}

export default function OverviewPage() {
  const [stats, setStats] = useState<Stats>({ 
    totalCustomers: 0, totalOrders: 0, activeCustomers: 0, totalMessages: 0, totalRevenue: 0, totalCosts: 0 
  })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const tenantId = user.user_metadata?.tenant_id || 'default'

      const [
        { count: totalCustomers },
        { count: activeCustomers },
        { count: totalMessages },
        { data: allOrders },
        { data: allCosts },
        { data: conversations },
      ] = await Promise.all([
        supabase.from('crm').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('crm').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'active'),
        supabase.from('chat_history').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('orders').select('*').eq('tenant_id', tenantId).order('order_time', { ascending: false }),
        supabase.from('costs').select('id, amount, date').eq('tenant_id', tenantId),
        supabase.from('crm').select('customer_phone, last_message, last_contact').eq('tenant_id', tenantId).order('last_contact', { ascending: false }).limit(5),
      ])

      const validOrders = allOrders || []
      const validCosts = allCosts || []
      
      // Calculate revenue by looking at the specific `revenue` column in orders. Fallback to order_summary parsing.
      const totalRevenue = validOrders.reduce((sum: number, order: any) => sum + (order.revenue || extractAmount(order.order_summary)), 0)
      const totalCosts = validCosts.reduce((sum: number, cost: any) => sum + cost.amount, 0)

      setStats({ 
        totalCustomers: totalCustomers || 0, 
        totalOrders: validOrders.length, 
        activeCustomers: activeCustomers || 0, 
        totalMessages: totalMessages || 0,
        totalRevenue,
        totalCosts
      })
      
      setRecentOrders(validOrders.slice(0, 5))
      setRecentConversations(conversations || [])

      // Process Chart Data (Last 7 Days)
      const last7Days = Array.from({ length: 7 }).map((_, i) => subDays(new Date(), i)).reverse()
      
      const chartAggregated = last7Days.map(date => {
        const dateStr = format(date, 'MMM dd')
        
        // Filter orders for this day and extract revenue
        const dayOrders = validOrders.filter((o: any) => o.order_time && isSameDay(new Date(o.order_time), date))
        const dayRevenue = dayOrders.reduce((sum: number, o: any) => sum + (o.revenue || extractAmount(o.order_summary)), 0)
        
        // Filter costs for this day
        const dayCostsData = validCosts.filter((c: any) => c.date && isSameDay(new Date(c.date), date))
        const dayCosts = dayCostsData.reduce((sum: number, c: any) => sum + c.amount, 0)

        return {
          name: dateStr,
          Revenue: dayRevenue,
          Costs: dayCosts,
          Profit: dayRevenue - dayCosts
        }
      })

      setChartData(chartAggregated)
      setLoading(false)
    }
    fetchData()
  }, [])

  const statCards = [
    { icon: DollarSign, label: 'Total Pendapatan', value: stats.totalRevenue, color: 'bg-green-100 text-green-700', isCurrency: true },
    { icon: Wallet, label: 'Laba Bersih', value: stats.totalRevenue - stats.totalCosts, color: 'bg-emerald-100 text-emerald-700', isCurrency: true },
    { icon: ShoppingBag, label: 'Total Pesanan', value: stats.totalOrders, color: 'bg-orange-50 text-orange-600' },
    { icon: Users, label: 'Total Pelanggan', value: stats.totalCustomers, color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ringkasan</h1>
        <p className="text-sm text-gray-500 mt-0.5">Selamat datang kembali. Berikut ringkasan aktivitas Anda.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => <StatCard key={card.label} {...card} loading={loading} />)}
      </div>

      {/* CHARTS */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Pendapatan & Pengeluaran (7 Hari Terakhir)</h2>
        <div className="h-[300px] w-full">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-200 animate-pulse">
              <span className="text-gray-400 font-medium text-sm">Memuat grafik...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={(value) => {
                    const absVal = Math.abs(value);
                    if (absVal >= 1000000) return `Rp ${(value / 1000000).toFixed(1)}M`;
                    if (absVal >= 1000) return `Rp ${(value / 1000).toFixed(0)}K`;
                    return `Rp ${value}`;
                  }}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                  formatter={(value: any) => {
                    const numValue = Number(value) || 0;
                    return [`Rp ${numValue.toLocaleString('id-ID')}`, ''];
                  }}
                />
                <Area type="monotone" dataKey="Revenue" stroke="#16a34a" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                <Area type="monotone" dataKey="Costs" stroke="#dc2626" fillOpacity={1} fill="url(#colorCost)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Pesanan Terbaru</h2>
            <Link href="/dashboard/orders" className="text-xs text-green-600 hover:text-green-700 font-medium">Lihat semua</Link>
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
                <p className="text-sm text-gray-400">Belum ada pesanan</p>
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
            <h2 className="font-semibold text-gray-900">Percakapan Terbaru</h2>
            <Link href="/dashboard/conversations" className="text-xs text-green-600 hover:text-green-700 font-medium">Lihat semua</Link>
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
                <p className="text-sm text-gray-400">Belum ada percakapan</p>
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
