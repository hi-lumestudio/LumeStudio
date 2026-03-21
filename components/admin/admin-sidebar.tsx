'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Activity,
  DollarSign,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Ringkasan', icon: LayoutDashboard, exact: true },
  { href: '/admin/clients', label: 'Kelola Klien', icon: Users, exact: false },
  { href: '/admin/clients/new', label: 'Klien Baru', icon: UserPlus, exact: true },
  { href: '/admin/usage', label: 'Penggunaan AI', icon: Activity, exact: true },
  { href: '/admin/revenue', label: 'Pendapatan', icon: DollarSign, exact: true },
]

interface AdminSidebarProps {
  userEmail: string
}

function NavContent({
  userEmail,
  onLinkClick,
}: AdminSidebarProps & { onLinkClick?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-700/50">
        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-indigo-400" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-white text-sm leading-tight">Lume Studio</div>
          <div className="text-xs text-gray-400 leading-tight">Admin Panel</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact
            ? pathname === href
            : pathname.startsWith(href) && (href !== '/admin/clients' || !pathname.includes('/new'))
          return (
            <Link
              key={href}
              href={href}
              onClick={onLinkClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-500/15 text-indigo-300'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              )}
            >
              <Icon
                className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-indigo-400' : 'text-gray-500')}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-gray-700/50">
        <div className="px-3 py-1.5 mb-1">
          <div className="text-xs text-gray-500 truncate">{userEmail}</div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-gray-200 w-full transition-colors"
        >
          <LogOut className="w-5 h-5 text-gray-500 flex-shrink-0" />
          Keluar
        </button>
      </div>
    </div>
  )
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-gray-900 border-r border-gray-800 fixed inset-y-0 left-0 z-30">
        <NavContent userEmail={userEmail} />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-gray-900 border-b border-gray-800 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          <span className="font-bold text-white text-sm">Lume Studio Admin</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-md hover:bg-gray-800 text-gray-400"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-20">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gray-900 flex flex-col z-10">
            <NavContent
              userEmail={userEmail}
              onLinkClick={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}
    </>
  )
}
