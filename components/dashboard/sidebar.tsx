'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  MessageCircle,
  Users,
  ShoppingBag,
  Database,
  Settings,
  LogOut,
  Menu,
  X,
  Wallet,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/conversations', label: 'Conversations', icon: MessageCircle, exact: false },
  { href: '/dashboard/crm', label: 'CRM', icon: Users, exact: false },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag, exact: false },
  { href: '/dashboard/costs', label: 'Costs', icon: Wallet, exact: false },
  { href: '/dashboard/business-data', label: 'Business Data', icon: Database, exact: false },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings, exact: false },
]

interface SidebarProps {
  tenantName: string
  userEmail: string
}

function NavContent({
  tenantName,
  userEmail,
  onLinkClick,
}: SidebarProps & { onLinkClick?: () => void }) {
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
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-200">
        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
          <img src="/Lume_Studio_Logo.svg" alt="Lume Studio Logo" className="w-8 h-8" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-gray-900 text-sm leading-tight">Lume Studio</div>
          <div className="text-xs text-gray-500 leading-tight truncate">{tenantName}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={onLinkClick}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <Icon
                className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-green-600' : 'text-gray-400')}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-gray-200">
        <div className="px-3 py-1.5 mb-1">
          <div className="text-xs text-gray-500 truncate">{userEmail}</div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors"
        >
          <LogOut className="w-5 h-5 text-gray-400 flex-shrink-0" />
          Logout
        </button>
      </div>
    </div>
  )
}

export function Sidebar({ tenantName, userEmail }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-30">
        <NavContent tenantName={tenantName} userEmail={userEmail} />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 flex items-center justify-center">
            <img src="/Lume_Studio_Logo.svg" alt="Lume Studio Logo" className="w-7 h-7" />
          </div>
          <span className="font-bold text-gray-900">Lume Studio</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-600"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-20">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white flex flex-col z-10">
            <NavContent
              tenantName={tenantName}
              userEmail={userEmail}
              onLinkClick={() => setMobileOpen(false)}
            />
          </aside>
        </div>
      )}
    </>
  )
}
