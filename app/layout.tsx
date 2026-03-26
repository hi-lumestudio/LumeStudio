import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import Image from 'next/image'
import { Analytics } from "@vercel/analytics/next"
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const siteUrl = 'https://lumestudio.id'

export const metadata: Metadata = {
  title: {
    default: 'Lume Studio — Chatbot WhatsApp AI untuk Bisnis Indonesia',
    template: '%s | Lume Studio',
  },
  description:
    'Lume Studio membantu bisnis Indonesia otomasi WhatsApp dengan AI: auto-reply 24/7, CRM otomatis, manajemen pesanan, dan analitik. Setup manual, pendampingan langsung, go-live dalam 3 menit.',
  keywords: [
    'chatbot WhatsApp bisnis',
    'otomasi WhatsApp Indonesia',
    'WhatsApp AI Indonesia',
    'auto reply WhatsApp otomatis',
    'CRM WhatsApp UMKM',
    'WhatsApp Business API Indonesia',
    'chatbot AI bisnis kecil',
    'otomatisasi pesan WhatsApp',
    'dashboard WhatsApp bisnis',
    'AI WhatsApp chatbot',
    'manajemen pesanan WhatsApp',
    'chatbot WhatsApp kafe',
    'chatbot WhatsApp toko online',
    'WhatsApp bot jualan',
    'Lume Studio',
  ],
  authors: [{ name: 'Lume Studio', url: siteUrl }],
  creator: 'Lume Studio',
  metadataBase: new URL(siteUrl),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: siteUrl,
    siteName: 'Lume Studio',
    title: 'Lume Studio — Chatbot WhatsApp AI untuk Bisnis Indonesia',
    description:
      'Otomasi WhatsApp bisnis Anda dengan AI. Auto-reply 24/7, CRM bawaan, manajemen pesanan, dan analitik dalam satu dashboard.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Lume Studio — Dashboard Chatbot WhatsApp AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lume Studio — Chatbot WhatsApp AI untuk Bisnis Indonesia',
    description:
      'Otomasi WhatsApp bisnis Anda dengan AI. Auto-reply 24/7, CRM bawaan, manajemen pesanan.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/Lume_Studio_Logo.svg',
    shortcut: '/Lume_Studio_Logo.svg',
    apple: '/Lume_Studio_Logo.svg',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: '6b64b84a0a83ad5e',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={inter.variable}>
        {/* Global logo header */}
        <header className="w-full flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-100">
          <Image src="/Lume_Studio_Logo.svg"
           width={32}
           height={32}
           alt="Lume Studio Logo" 
           className="w-8 h-8" />
          <span className="font-bold text-lg text-gray-900 tracking-tight">Lume Studio</span>
        </header>
        {children}
        <Analytics />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
