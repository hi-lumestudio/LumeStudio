import Link from 'next/link'
import {
  MessageSquare,
  Users,
  ShoppingBag,
  Clock,
  Check,
  ArrowRight,
  Zap,
  Bot,
  BarChart3,
  Shield,
  Star,
  ChevronRight,
  Sparkles,
  Crown,
} from 'lucide-react'

const stats = [
  { value: '10.000+', label: 'Pesan Ditangani Setiap Hari' },
  { value: '500+', label: 'Bisnis Mempercayai Kami' },
  { value: '99,9%', label: 'Uptime Terjamin' },
  { value: '3 menit', label: 'Rata-rata Waktu Setup' },
]

const features = [
  {
    icon: Bot,
    title: 'AI Auto-Reply',
    desc: 'Asisten AI kamu menangani pesan pelanggan 24/7 dengan respons cerdas dan kontekstual — tanpa perlu campur tangan manusia.',
    gradient: 'from-violet-500 to-purple-600',
    bg: 'bg-violet-50',
  },
  {
    icon: Users,
    title: 'CRM Bawaan',
    desc: 'Setiap pelanggan, setiap percakapan, setiap interaksi — terorganisir dalam satu dashboard yang powerful.',
    gradient: 'from-blue-500 to-cyan-600',
    bg: 'bg-blue-50',
  },
  {
    icon: ShoppingBag,
    title: 'Manajemen Pesanan',
    desc: 'Lacak dan kelola semua pesanan pelanggan dengan update status real-time langsung via WhatsApp.',
    gradient: 'from-orange-500 to-amber-500',
    bg: 'bg-orange-50',
  },
  {
    icon: BarChart3,
    title: 'Analitik & Insight',
    desc: 'Pahami pelanggan kamu lebih baik dengan analitik percakapan, tingkat respons, dan tren bisnis.',
    gradient: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
  },
  {
    icon: Clock,
    title: '24/7 Selalu Aktif',
    desc: 'Jangan pernah lewatkan lead atau pertanyaan pelanggan lagi. Lume Studio bekerja terus saat kamu tidur.',
    gradient: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-50',
  },
  {
    icon: Shield,
    title: 'Aman & Andal',
    desc: 'Keamanan setara enterprise dengan enkripsi end-to-end. Data kamu tetap privat dan terlindungi.',
    gradient: 'from-slate-500 to-gray-600',
    bg: 'bg-slate-50',
  },
]

const steps = [
  {
    step: '01',
    title: 'Hubungkan WhatsApp',
    desc: 'Sambungkan nomor WhatsApp Business kamu dalam waktu kurang dari 3 menit. Tanpa keahlian teknis.',
  },
  {
    step: '02',
    title: 'Latih AI Kamu',
    desc: 'Upload info bisnis, FAQ, dan katalog produk kamu. AI akan mempelajari gaya komunikasi brand kamu.',
  },
  {
    step: '03',
    title: 'Go Live & Berkembang',
    desc: 'Lihat AI kamu menangani pertanyaan, menangkap lead, dan menutup pesanan — secara otomatis.',
  },
]

const plans = [
  {
    name: 'Starter',
    price: 'Rp 600.000',
    period: '/bulan',
    desc: 'Cocok untuk bisnis yang baru mulai otomatisasi',
    features: [
      '7.500 AI Responses/bulan',
      '1 Nomor WhatsApp',
      'AI Chatbot 24/7',
      'CRM Otomatis',
      'Laporan Performa Bulanan',
      'Custom AI Personality',
      'Support via WhatsApp',
    ],
    featured: false,
    cta: 'Mulai Sekarang',
  },
  {
    name: 'Pro',
    price: 'Rp 1.200.000',
    period: '/bulan',
    desc: 'Cocok untuk bisnis dengan traffic WhatsApp tinggi',
    features: [
      '20.000 AI Responses/bulan',
      '1 Nomor WhatsApp',
      'AI Chatbot 24/7',
      'CRM Otomatis',
      'Laporan Performa Bulanan',
      'Custom AI Personality',
      'Dedicated Support',
    ],
    featured: true,
    cta: 'Mulai Sekarang',
  },
]

const testimonials = [
  {
    quote: "Lume Studio memangkas waktu respons kami dari berjam-jam jadi detik. Pelanggan kami suka betapa cepatnya kami membalas.",
    name: 'Sari Dewi',
    role: 'Pemilik, Bloom Bakery Jakarta',
    rating: 5,
  },
  {
    quote: "Kami menangani 3x lebih banyak pesanan tanpa menambah karyawan. AI-nya tahu menu kami lebih baik dari sebagian pegawai!",
    name: 'Rizal Hasan',
    role: 'CEO, Warung Mie Bandung',
    rating: 5,
  },
  {
    quote: "Setup cuma 5 menit. Sekarang saya tenang tidur karena setiap pertanyaan pelanggan langsung dijawab.",
    name: 'Putri Anggraini',
    role: 'Founder, Toko Bunga Surabaya',
    rating: 5,
  },
]

const chatMessages = [
  { from: 'customer', text: 'Halo! Kue cokelat nya ready hari ini?' },
  { from: 'ai', text: "Ready kak! 🎂 Kami punya Dark Chocolate Fudge Cake, harganya Rp 150.000 ukuran 6 inch. Mau pesan?" },
  { from: 'customer', text: 'Mau dong! Bisa pick up jam 3 sore?' },
  { from: 'ai', text: "Siap kak! Pesanan sudah dicatat — 1x Dark Chocolate Fudge Cake untuk pickup jam 3 sore hari ini. Boleh tahu nama untuk pesanannya? 😊" },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-inter)] antialiased">

      {/* ─── Nav ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-700 rounded-lg flex items-center justify-center shadow-sm">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 tracking-tight">Lume Studio</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Fitur</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">Cara Kerja</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">Harga</a>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Masuk
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="relative pt-16 overflow-hidden bg-[#0a0a0f]">
        {/* Background glow blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-emerald-600/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-green-900/20 rounded-full blur-[80px]" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-0">
          <div className="text-center max-w-4xl mx-auto mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 text-sm text-green-400 mb-8">
              <Zap className="w-3.5 h-3.5" />
              Otomatisasi WhatsApp Berbasis AI
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white mb-6">
              Bisnis Kamu di{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                Autopilot
              </span>
              , 24/7
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              Lume Studio adalah asisten AI WhatsApp yang menangani pertanyaan pelanggan, mengelola pesanan,
              dan mengembangkan bisnis kamu — bahkan saat kamu tidur.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="https://wa.me/+6282332821531"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white px-8 py-4 rounded-xl text-base font-semibold transition-all shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.5)]"
                target="_blank"
                rel="noopener noreferrer"
              >
                Konsultasi Gratis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#how-it-works"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white px-6 py-4 text-base font-medium transition-colors"
              >
                Lihat cara kerjanya
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Chat mockup */}
          <div className="relative max-w-sm mx-auto pb-0">
            {/* Phone frame */}
            <div className="relative bg-[#111118] rounded-t-3xl border border-white/10 border-b-0 overflow-hidden shadow-2xl shadow-black/50 pt-4">
              {/* WhatsApp header */}
              <div className="flex items-center gap-3 px-4 py-3 bg-green-600">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">Lume AI Assistant</p>
                  <p className="text-green-200 text-xs">Online</p>
                </div>
              </div>

              {/* Chat area */}
              <div className="bg-[#0b141a] px-3 py-4 space-y-3 min-h-[280px]">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.from === 'customer' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed ${msg.from === 'customer'
                        ? 'bg-green-600 text-white rounded-tr-sm'
                        : 'bg-[#1f2c34] text-gray-200 rounded-tl-sm'
                        }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {/* Typing indicator */}
                <div className="flex justify-start">
                  <div className="bg-[#1f2c34] px-4 py-3 rounded-xl rounded-tl-sm flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            </div>
            {/* Fade out at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#0a0a0f] to-transparent" />
          </div>
        </div>
      </section>

      {/* ─── Stats bar ─── */}
      <section className="bg-gray-50 border-y border-gray-100 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map(({ value, label }) => (
              <div key={label}>
                <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-3">Setup Mudah</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Aktif dan berjalan dalam hitungan menit</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Tanpa coding. Tanpa setup ribet. Tinggal hubungkan dan biarkan Lume Studio yang mengurus sisanya.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector lines */}
            <div className="hidden md:block absolute top-10 left-1/3 right-1/3 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="relative text-center px-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-900 text-white text-xl font-bold mb-6">
                  {step}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-3">Fitur</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Semua yang bisnis kamu butuhkan</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Tools powerful yang dirancang untuk bisnis Indonesia — dari F&B hingga retail dan lainnya.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc, gradient }) => (
              <div
                key={title}
                className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200"
              >
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-5`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-lg">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-3">Testimoni</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Dipercaya oleh bisnis di seluruh Indonesia</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map(({ quote, name, role, rating }) => (
              <div key={name} className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 leading-relaxed mb-6 text-sm">"{quote}"</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{name}</p>
                  <p className="text-gray-500 text-xs">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-3">Harga</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Harga Simpel, Tanpa Ribet</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Pilih paket yang sesuai kebutuhan bisnis kamu. Tanpa biaya tersembunyi.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-start">
            {plans.map(({ name, price, period, desc, features: planFeatures, featured, cta }) => (
              <div
                key={name}
                className={`relative rounded-2xl p-8 flex flex-col transition-all duration-300 ${featured
                  ? 'bg-gray-900 text-white shadow-2xl ring-2 ring-green-500/50 md:scale-[1.03] shadow-green-500/10'
                  : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg'
                  }`}
              >
                {featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg shadow-green-500/30">
                      <Crown className="w-3 h-3" />
                      Populer
                    </span>
                  </div>
                )}
                <div className="mb-8">
                  <h3 className={`text-xl font-bold mb-2 ${featured ? 'text-white' : 'text-gray-900'}`}>
                    {name}
                  </h3>
                  <p className={`text-sm mb-6 ${featured ? 'text-gray-400' : 'text-gray-500'}`}>{desc}</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold tracking-tight ${featured ? 'text-white' : 'text-gray-900'}`}>
                      {price}
                    </span>
                    {period && (
                      <span className={`text-sm font-medium ${featured ? 'text-gray-400' : 'text-gray-500'}`}>{period}</span>
                    )}
                  </div>
                </div>
                <div className={`h-px mb-6 ${featured ? 'bg-white/10' : 'bg-gray-100'}`} />
                <ul className="space-y-3.5 mb-8 flex-1">
                  {planFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <div className={`w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center ${featured ? 'bg-green-500/20' : 'bg-green-50'}`}>
                        <Check className={`w-3 h-3 ${featured ? 'text-green-400' : 'text-green-600'}`} />
                      </div>
                      <span className={featured ? 'text-gray-300' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="https://wa.me/+6282332821531"
                  className={`block text-center py-3.5 px-6 rounded-xl font-semibold text-sm transition-all duration-200 ${featured
                    ? 'bg-green-500 text-white hover:bg-green-400 shadow-[0_0_24px_rgba(34,197,94,0.3)] hover:shadow-[0_0_32px_rgba(34,197,94,0.4)]'
                    : 'bg-gray-900 text-white hover:bg-gray-700'
                    }`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {cta}
                  <ArrowRight className="w-4 h-4 inline-block ml-2" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative py-24 bg-[#0a0a0f] overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-green-500/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 text-sm text-green-400 mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Siap untuk otomatisasi?
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
            Biarkan AI tangani{' '}
            <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
              WhatsApp
            </span>{' '}
            kamu hari ini
          </h2>
          <p className="text-lg text-gray-400 mb-10 leading-relaxed">
            Bergabung dengan ratusan bisnis Indonesia yang sudah menggunakan Lume Studio untuk melayani pelanggan lebih cepat,
            menangkap lebih banyak pesanan, dan berkembang — di autopilot.
          </p>
          <Link
            href="https://wa.me/+6282332821531"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all shadow-[0_0_40px_rgba(34,197,94,0.3)] hover:shadow-[0_0_60px_rgba(34,197,94,0.5)]"
            target="_blank"
            rel="noopener noreferrer"
          >
            Konsultasi Gratis Sekarang
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="bg-[#050508] text-gray-600 py-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-700 rounded-lg flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-white text-sm">Lume Studio</span>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} Lume Studio. Hak cipta dilindungi.</p>
          <div className="flex gap-6 text-xs">
            <a href="#" className="hover:text-gray-400 transition-colors">Kebijakan Privasi</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Syarat & Ketentuan</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
