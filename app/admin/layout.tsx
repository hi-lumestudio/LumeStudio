import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Double-check admin role (middleware should catch this, but just in case)
  if (user.user_metadata?.role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-950 font-[family-name:var(--font-inter)]">
      <AdminSidebar userEmail={user.email || ''} />
      <div className="lg:pl-64">
        {/* Spacer for mobile top bar */}
        <div className="lg:hidden h-14" />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
