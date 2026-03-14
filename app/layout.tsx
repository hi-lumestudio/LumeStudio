import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import Image from 'next/image'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'Lume Studio',
  description: 'AI WhatsApp Chatbot Dashboard for Your Business',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
