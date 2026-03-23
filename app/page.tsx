import Link from 'next/link'
import DashboardShowcase from '@/components/dashboard-showcase'
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
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react'

const stats = [
  { value: 'Siap Digunakan', label: 'Untuk Bisnis Indonesia' },
  { value: '24/7', label: 'AI Otomatisasi WhatsApp' },
  { value: '3 menit', label: 'Rata-rata Waktu Setup' },
  { value: '100% Lokal', label: 'Bahasa Indonesia & Rupiah' },
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
    title: 'Konsultasi & Onboarding',
    desc: 'Kami bantu setup n8n dan WhatsApp Business secara manual, langsung via WhatsApp atau tatap muka. Tidak perlu keahlian teknis.',
  },
  {
    step: '02',
    title: 'Personalisasi AI',
    desc: 'Semua info bisnis, FAQ, dan katalog produk diinput bersama. AI disesuaikan dengan gaya komunikasi dan kebutuhan bisnis Anda.',
  },
  {
    step: '03',
    title: 'Go Live & Customisasi',
    desc: 'Solusi Lume Studio sepenuhnya dapat dikustomisasi untuk setiap bisnis. Kami dampingi hingga AI siap menangani pelanggan dan pesanan Anda.',
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
      'Tanpa watermark — pesan AI tanpa branding',
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
      'Tanpa watermark — pesan AI tanpa branding',
    ],
    featured: true,
    cta: 'Mulai Sekarang',
  },
]

const businessTypes = [
  {
    title: 'F&B & Kafe',
    desc: 'Order masuk via WhatsApp, butuh respons cepat dan status pesanan yang rapi.',
  },
  {
    title: 'Klinik & Beauty',
    desc: 'Banyak pertanyaan berulang tentang jadwal, treatment, dan harga.',
  },
  {
    title: 'Retail & Toko Online',
    desc: 'Butuh follow-up lead, katalog produk, dan rekap pelanggan dalam satu tempat.',
  },
  {
    title: 'Jasa Lokal',
    desc: 'Cocok untuk bisnis jasa yang ingin respons konsisten tanpa tambah admin baru.',
  },
]

const realityPoints = [
  'Onboarding dilakukan manual, dipandu langsung via WhatsApp atau tatap muka.',
  'Workflow n8n disesuaikan per bisnis, bukan template asal tempel.',
  'AI dilatih dari materi bisnis Anda: FAQ, katalog, SOP, dan gaya bahasa brand.',
  'Go-live bertahap: mulai dari use case sederhana lalu ditingkatkan sesuai kebutuhan.',
]

const faqItems = [
  {
    q: 'Apakah ini langsung jadi tanpa setup?',
    a: 'Tidak. Setup dilakukan bersama agar sesuai kebutuhan bisnis Anda. Kami bantu dari awal sampai siap pakai.',
  },
  {
    q: 'Apakah bisa custom untuk bisnis saya?',
    a: 'Bisa. Alur chat, jenis pertanyaan, format order, sampai gaya jawaban AI bisa disesuaikan.',
  },
  {
    q: 'Apakah data saya aman?',
    a: 'Data disimpan di Supabase dan akses dashboard membutuhkan login. Kami juga mendorong penggunaan RLS untuk membatasi akses data per tenant.',
  },
  {
    q: 'Kalau belum siap full otomatis, bisa bertahap?',
    a: 'Bisa. Banyak bisnis mulai dari auto-reply FAQ dulu, lalu tambah otomatisasi order dan CRM setelah tim siap.',
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
            <img src="/Lume_Studio_Logo.svg" alt="Lume Studio Logo" className="w-8 h-8" />
            <span className="font-bold text-lg text-gray-900 tracking-tight">Lume Studio</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Fitur</a>
            <a href="#how-it-works" className="hover:text-gray-900 transition-colors">Cara Kerja</a>
            <a href="#security" className="hover:text-gray-900 transition-colors">Keamanan</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
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
              Onboarding Dipandu Langsung
            </div>

            {/* Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight text-white mb-6">
              WhatsApp Bisnis Lebih{' '}
              <span className="bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
                Rapi & Cepat
              </span>
              {' '}dengan AI
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 mb-10 leading-relaxed max-w-2xl mx-auto">
              Lume Studio membantu bisnis Indonesia membangun sistem WhatsApp AI yang benar-benar dipakai:
              setup manual, alur custom, dan pendampingan sampai jalan.
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
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Implementasi nyata, bukan janji instan</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Kami kerjakan bersama Anda dari setup sampai go-live supaya sistem benar-benar cocok dengan operasional bisnis.
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

      {/* ─── Real-World Implementation ─── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-3">Realita Implementasi</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Yang Anda dapatkan saat onboarding</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {realityPoints.map((point) => (
              <div key={point} className="flex items-start gap-3 bg-white border border-gray-200 rounded-xl p-5">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700 text-sm leading-relaxed">{point}</p>
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

      {/* ─── Dashboard Showcase ─── */}
      <DashboardShowcase />

      {/* ─── Who It's For ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-3">Siapa yang Cocok</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Didesain untuk bisnis yang aktif di WhatsApp</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Fokus kami adalah bisnis yang ingin respons lebih cepat, data pelanggan lebih rapi, dan follow-up lebih konsisten.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {businessTypes.map(({ title, desc }) => (
              <div key={title} className="rounded-2xl border border-gray-200 p-6 bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Aspirational Section ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-3">Siap untuk Bisnis Anda</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Mulai Otomatisasi WhatsApp Sekarang</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Lume Studio siap membantu bisnis Indonesia bertransformasi ke era digital. Jadilah yang pertama memanfaatkan AI untuk melayani pelanggan dan mengelola pesanan secara otomatis.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto mb-10 rounded-2xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-800 leading-relaxed">
              Saat ini kami membuka batch early adopter terbatas agar onboarding tetap intensif dan kualitas implementasi terjaga.
            </p>
          </div>
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

      {/* ─── Security ─── */}
      <section id="security" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-3">Data & Keamanan</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Keamanan dibangun sejak awal</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Kami fokus pada praktik yang realistis: autentikasi login, pemisahan akses dashboard, dan kebijakan data yang jelas.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-gray-200 p-6">
              <ShieldCheck className="w-6 h-6 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Akses Terproteksi</h3>
              <p className="text-sm text-gray-600">Dashboard memerlukan login, dan route internal dilindungi middleware.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-6">
              <MessageSquare className="w-6 h-6 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Data Tetap Milik Anda</h3>
              <p className="text-sm text-gray-600">Percakapan, order, dan data pelanggan tetap berada dalam database bisnis Anda.</p>
            </div>
            <div className="rounded-2xl border border-gray-200 p-6">
              <Users className="w-6 h-6 text-green-600 mb-4" />
              <h3 className="font-semibold text-gray-900 mb-2">Fokus Single-Business</h3>
              <p className="text-sm text-gray-600">Saat ini sistem difokuskan untuk satu bisnis per implementasi agar onboarding dan kualitas setup tetap terjaga.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-3">FAQ</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Pertanyaan yang sering ditanyakan</h2>
          </div>
          <div className="space-y-4">
            {faqItems.map(({ q, a }) => (
              <details key={q} className="group bg-white rounded-xl border border-gray-200 p-5">
                <summary className="cursor-pointer list-none font-semibold text-gray-900 flex items-center justify-between gap-4">
                  {q}
                  <span className="text-gray-400 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">{a}</p>
              </details>
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
            Mulai Otomatisasi WhatsApp Bisnis Anda
          </h2>
          <p className="text-lg text-gray-400 mb-10 leading-relaxed">
            Lume Studio siap membantu bisnis Indonesia melayani pelanggan lebih cepat dan efisien. Konsultasi gratis untuk bisnis yang ingin mencoba solusi AI WhatsApp.
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
            <img src="/Lume_Studio_Logo.svg" alt="Lume Studio Logo" className="w-7 h-7" />
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
