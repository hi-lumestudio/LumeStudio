'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, DollarSign, Users, ShoppingBag, Wallet, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface DashboardData {
  businessName: string
  stats: {
    totalCustomers: number
    totalOrders: number
    totalRevenue: number
    totalCosts: number
  }
  recentOrders: Array<{
    id: string
    customer_phone: string
    order_summary: string
    revenue?: number
    created_at: string
    status: string
  }>
  recentConversations: Array<{
    phone: string
    name: string | null
    last_preview: string
    last_contact: string
  }>
  customerMap: Record<string, string | null>
}

function getStatusStyle(status: string) {
  const s = status?.toLowerCase()
  if (s === 'completed') return 'bg-green-100 text-green-700'
  if (s === 'shipped') return 'bg-indigo-100 text-indigo-700'
  if (s === 'confirmed' || s === 'payment confirmed') return 'bg-purple-100 text-purple-700'
  if (s === 'waiting_payment' || s === 'waiting payment' || s === 'pending') return 'bg-yellow-100 text-yellow-700'
  return 'bg-gray-100 text-gray-700'
}

function formatRupiah(num: number) {
  return 'Rp ' + num.toLocaleString('id-ID')
}

export default function ImpersonateDashboardPage() {
  const params = useParams()
  const router = useRouter()
  const tenantId = params.id as string
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/admin/tenants/${tenantId}/dashboard`)
      if (res.ok) {
        setData(await res.json())
      }
      setLoading(false)
    }
    fetchData()
  }, [tenantId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Data tidak ditemukan</p>
      </div>
    )
  }

  const statCards = [
    { icon: DollarSign, label: 'Pendapatan Bulan Ini', value: formatRupiah(data.stats.totalRevenue), color: 'bg-green-100 text-green-700' },
    { icon: Wallet, label: 'Laba Bersih', value: formatRupiah(data.stats.totalRevenue - data.stats.totalCosts), color: 'bg-emerald-100 text-emerald-700' },
    { icon: ShoppingBag, label: 'Pesanan', value: data.stats.totalOrders.toString(), color: 'bg-orange-50 text-orange-600' },
    { icon: Users, label: 'Total Pelanggan', value: data.stats.totalCustomers.toString(), color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div className="space-y-6">
      {/* Impersonate Banner */}
      <div className="bg-yellow-500/15 border border-yellow-500/30 rounded-xl px-5 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
          <p className="text-sm text-yellow-300 font-medium">
            Anda melihat sebagai: <span className="text-yellow-200 font-bold">{data.businessName}</span>
          </p>
        </div>
        <Link
          href={`/admin/clients/${tenantId}`}
          className="text-xs text-yellow-400 hover:text-yellow-300 font-medium flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          Kembali ke Detail
        </Link>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Ringkasan — {data.businessName}</h1>
        <p className="text-sm text-gray-400 mt-0.5">Dashboard klien bulan ini</p>
      </div>

      {/* Stats Cards — using light theme card style like client dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500">{card.label}</span>
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Pesanan Terbaru</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentOrders.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <ShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Belum ada pesanan bulan ini</p>
              </div>
            ) : data.recentOrders.map(order => (
              <div key={order.id} className="px-6 py-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {data.customerMap[order.customer_phone] || order.customer_phone}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{order.order_summary}</p>
                  {order.revenue ? (
                    <p className="text-xs font-medium text-green-600 mt-0.5">{formatRupiah(Number(order.revenue))}</p>
                  ) : null}
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize flex-shrink-0 ${getStatusStyle(order.status)}`}>
                  {order.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Conversations */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Percakapan Terbaru</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {data.recentConversations.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Belum ada percakapan</p>
              </div>
            ) : data.recentConversations.map(conv => (
              <div key={conv.phone} className="px-6 py-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {conv.name ? conv.name.charAt(0).toUpperCase() : conv.phone?.slice(-2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900">{conv.name || conv.phone}</p>
                  {conv.name && <p className="text-xs text-gray-400">{conv.phone}</p>}
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{conv.last_preview}</p>
                  {conv.last_contact && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDistanceToNow(new Date(conv.last_contact), { addSuffix: true })}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
