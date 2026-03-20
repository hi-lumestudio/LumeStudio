'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, Users, ShoppingBag, DollarSign, Wallet, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { formatDistanceToNow, format, startOfMonth, endOfMonth, subMonths, addMonths, isSameDay, isWithinInterval, isAfter } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import Link from 'next/link'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

interface Stats {
  totalOrders: number
  totalRevenue: number
  totalCosts: number
  totalCustomers: number
}

interface Order {
  id: string
  customer_phone: string
  order_summary: string
  revenue?: number
  created_at: string
  status: string
}

interface Cost {
  id: string
  amount: number
  date: string
}

interface Conversation {
  phone: string
  name: string | null
  last_preview: string
  last_contact: string
}

// We'll also load customer names for orders
interface CustomerMap {
  [phone: string]: string | null
}

function getStatusStyle(status: string) {
  const s = status?.toLowerCase()
  if (s === 'completed') return 'bg-green-100 text-green-700'
  if (s === 'shipped') return 'bg-indigo-100 text-indigo-700'
  if (s === 'payment confirmed') return 'bg-purple-100 text-purple-700'
  if (s === 'waiting payment' || s === 'pending') return 'bg-yellow-100 text-yellow-700'
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

export default function OverviewPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalRevenue: 0, totalCosts: 0, totalCustomers: 0 })
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [recentConversations, setRecentConversations] = useState<Conversation[]>([])
  const [customerMap, setCustomerMap] = useState<CustomerMap>({})
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const monthStart = startOfMonth(selectedMonth)
  const monthEnd = endOfMonth(selectedMonth)
  const isCurrentMonth = format(selectedMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM')
  const canGoNext = !isAfter(startOfMonth(addMonths(selectedMonth, 1)), startOfMonth(new Date()))

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const tenantId = user.id

      const mStart = format(monthStart, 'yyyy-MM-dd')
      const mEnd = format(monthEnd, 'yyyy-MM-dd')

      const [
        { count: totalCustomers },
        { data: allOrders },
        { data: allCosts },
        { data: conversations },
        { data: customers },
      ] = await Promise.all([
        supabase.from('customers').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
        supabase.from('orders_v2').select('*').eq('tenant_id', tenantId).gte('created_at', mStart).lte('created_at', mEnd + 'T23:59:59').order('created_at', { ascending: false }),
        supabase.from('costs_v2').select('id, amount, date').eq('tenant_id', tenantId).gte('date', mStart).lte('date', mEnd),
        supabase.from('customers').select('phone, name, last_preview, last_contact').eq('tenant_id', tenantId).order('last_contact', { ascending: false }).limit(5),
        supabase.from('customers').select('phone, name').eq('tenant_id', tenantId),
      ])

      const validOrders = allOrders || []
      const validCosts = allCosts || []

      // Build phone → name map
      const cMap: CustomerMap = {}
        ; (customers || []).forEach((c: any) => { if (c.phone) cMap[c.phone] = c.name })
      setCustomerMap(cMap)

      const totalRevenue = validOrders.reduce((sum: number, order: any) => sum + (Number(order.revenue) || 0), 0)
      const totalCosts = validCosts.reduce((sum: number, cost: any) => sum + Number(cost.amount || 0), 0)

      setStats({
        totalCustomers: totalCustomers || 0,
        totalOrders: validOrders.length,
        totalRevenue,
        totalCosts
      })

      setRecentOrders(validOrders.slice(0, 5))
      setRecentConversations(conversations || [])

      // Chart: daily breakdown within selected month
      const daysInMonth = monthEnd.getDate()
      const chartDays = Array.from({ length: daysInMonth }).map((_, i) => {
        const d = new Date(monthStart)
        d.setDate(i + 1)
        return d
      })

      const chartAggregated = chartDays.map(date => {
        const dateStr = format(date, 'd')
        const dayOrders = validOrders.filter((o: any) => o.created_at && isSameDay(new Date(o.created_at), date))
        const dayRevenue = dayOrders.reduce((sum: number, o: any) => sum + (Number(o.revenue) || 0), 0)
        const dayCostsData = validCosts.filter((c: any) => c.date && isSameDay(new Date(c.date), date))
        const dayCosts = dayCostsData.reduce((sum: number, c: any) => sum + Number(c.amount || 0), 0)
        return { name: dateStr, Pendapatan: dayRevenue, Pengeluaran: dayCosts }
      })

      setChartData(chartAggregated)
      setLoading(false)
    }
    fetchData()
  }, [selectedMonth])

  const monthLabel = format(selectedMonth, 'MMMM yyyy', { locale: idLocale })

  const statCards = [
    { icon: DollarSign, label: 'Pendapatan Bulan Ini', value: stats.totalRevenue, color: 'bg-green-100 text-green-700', isCurrency: true },
    { icon: Wallet, label: 'Laba Bersih', value: stats.totalRevenue - stats.totalCosts, color: 'bg-emerald-100 text-emerald-700', isCurrency: true },
    { icon: ShoppingBag, label: 'Pesanan', value: stats.totalOrders, color: 'bg-orange-50 text-orange-600' },
    { icon: Users, label: 'Total Pelanggan', value: stats.totalCustomers, color: 'bg-purple-50 text-purple-600' },
  ]

  const getCustomerDisplay = (phone: string) => {
    const name = customerMap[phone]
    return name || phone
  }

  return (
    <div className="space-y-6">
      {/* HEADER with Month Picker */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ringkasan</h1>
          <p className="text-sm text-gray-500 mt-0.5">Laporan bulanan dashboard Anda.</p>
        </div>
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg px-1 py-1 shadow-sm">
          <button
            onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
          ><ChevronLeft className="w-4 h-4" /></button>
          <div className="flex items-center gap-1.5 px-3 min-w-[160px] justify-center">
            <CalendarDays className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-gray-900 capitalize">{monthLabel}</span>
          </div>
          <button
            onClick={() => canGoNext && setSelectedMonth(addMonths(selectedMonth, 1))}
            disabled={!canGoNext}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          ><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => <StatCard key={card.label} {...card} loading={loading} />)}
      </div>

      {/* CHART */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Pendapatan & Pengeluaran — <span className="capitalize">{monthLabel}</span></h2>
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
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 11 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }}
                  tickFormatter={(value) => {
                    const absVal = Math.abs(value);
                    if (absVal >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                    if (absVal >= 1000) return `${(value / 1000).toFixed(0)}K`;
                    return `${value}`;
                  }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)' }}
                  formatter={(value: any) => [`Rp ${(Number(value) || 0).toLocaleString('id-ID')}`, '']}
                />
                <Area type="monotone" dataKey="Pendapatan" stroke="#16a34a" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                <Area type="monotone" dataKey="Pengeluaran" stroke="#dc2626" fillOpacity={1} fill="url(#colorCost)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
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
                <p className="text-sm text-gray-400">Belum ada pesanan bulan ini</p>
              </div>
            ) : recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">{getCustomerDisplay(order.customer_phone)}</p>
                  {customerMap[order.customer_phone] && (
                    <p className="text-xs text-gray-400">{order.customer_phone}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{order.order_summary}</p>
                  {order.revenue ? (
                    <p className="text-xs font-medium text-green-600 mt-0.5">Rp {Number(order.revenue).toLocaleString('id-ID')}</p>
                  ) : null}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize flex-shrink-0 ${getStatusStyle(order.status)}`}>{order.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Conversations */}
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
              <Link key={conv.phone} href="/dashboard/conversations" className="px-6 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors block">
                <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {conv.name ? conv.name.charAt(0).toUpperCase() : conv.phone?.slice(-2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{conv.name || conv.phone}</p>
                  {conv.name && <p className="text-xs text-gray-400">{conv.phone}</p>}
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{conv.last_preview}</p>
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
