'use client'

import { useState } from 'react'
import Image from 'next/image'
import { LayoutDashboard, Users, ShoppingBag, BarChart3, Wallet } from 'lucide-react'

const tabs = [
  {
    id: 'dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
    image: '/Dashboard Tab.png',
    title: 'Pantau Bisnis dalam Sekejap',
    desc: 'Lihat ringkasan revenue, pelanggan aktif, dan status operasional harian secara real-time.'
  },
  {
    id: 'crm',
    label: 'CRM & Chat',
    icon: Users,
    image: '/Conversaton Tab.png',
    title: 'Interaksi Pelanggan Terpusat',
    desc: 'Semua percakapan AI, riwayat pelanggan, dan update pemesanan terorganisir di satu tempat.'
  },
  {
    id: 'orders',
    label: 'Manajemen Pesanan',
    icon: ShoppingBag,
    image: '/Orders Tab.png',
    title: 'Kelola Pesanan Lebih Mudah',
    desc: 'Lacak setiap pesanan dari masuk hingga selesai dengan detail item yang rapi.'
  },
  {
    id: 'analytics',
    label: 'Data Bisnis',
    icon: BarChart3,
    image: '/Business Data Tab.png',
    title: 'Analitik & Insight Mendalam',
    desc: 'Pahami sumber revenue, laporan penjualan bulanan, dan evaluasi performa AI assistant kamu.'
  },
  {
    id: 'costs',
    label: 'Pencatatan Biaya',
    icon: Wallet,
    image: '/Cost Tab.png',
    title: 'Kendali Finansial Transparan',
    desc: 'Catat dan pantau seluruh pengeluaran operasional bisnis langsung dari dashboard.'
  }
]

export default function DashboardShowcase() {
  const [activeTab, setActiveTab] = useState(tabs[0].id)
  const activeContent = tabs.find(t => t.id === activeTab)

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-3">Sekilas Dashboard</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Satu Tempat, Semua Kendali</h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Berhenti berpindah banyak aplikasi. Lume Studio menyatukan CRM, Pesanan, Analitik, dan Chat AI dalam satu dashboard yang intuitif.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-gray-50 rounded-2xl p-1.5 border border-gray-100 overflow-x-auto max-w-full">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                    isActive 
                      ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-900/5' 
                      : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Interactive Showcase Window */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content Area */}
          <div className="lg:col-span-4 relative h-[180px] lg:h-[240px] flex items-center">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`absolute inset-0 transition-all duration-500 flex flex-col justify-center ${
                  activeTab === tab.id
                    ? 'opacity-100 translate-y-0 relative z-10'
                    : 'opacity-0 translate-y-4 absolute inset-0 z-0 pointer-events-none'
                }`}
              >
                <div className="inline-flex w-12 h-12 rounded-2xl bg-green-50 text-green-600 items-center justify-center mb-6 ring-1 ring-green-100">
                  <tab.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{tab.title}</h3>
                <p className="text-gray-500 leading-relaxed text-lg">
                  {tab.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Browser / App Window Mockup */}
          <div className="lg:col-span-8 relative">
            <div className="absolute -inset-x-10 -inset-y-10 bg-gradient-to-tr from-green-500/10 via-emerald-400/5 to-transparent blur-3xl rounded-full opacity-50 pointer-events-none" />
            
            <div className="relative rounded-2xl bg-[#f8fafc] ring-1 ring-gray-900/5 shadow-2xl overflow-hidden pb-0 transition-transform duration-500 hover:scale-[1.01]">
              {/* Mock Browser Header */}
              <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 ml-4 hidden sm:block">
                  <div className="bg-gray-100 rounded-md py-1.5 px-3 max-w-sm mx-auto flex items-center text-xs text-gray-500 gap-2 font-mono">
                    <span className="text-gray-400">🔒</span>
                    lumestudio.my.id
                  </div>
                </div>
              </div>

              {/* Dynamic Image Container */}
              <div className="relative aspect-[16/10] bg-gray-50 w-full overflow-hidden">
                {tabs.map((tab) => (
                  <div
                    key={tab.id}
                    className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                      activeTab === tab.id ? 'opacity-100 z-10' : 'opacity-0 z-0'
                    }`}
                  >
                    <Image
                      src={tab.image}
                      alt={tab.title}
                      fill
                      className="object-cover object-left-top shadow-[0_0_15px_rgba(0,0,0,0.05)] border-t border-gray-100"
                      priority={tab.id === 'dashboard'}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
