import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Read tenant name from new tenants table, fallback to user_metadata
  let tenantName = user.user_metadata?.tenant_name || 'My Business'
  const { data: tenant } = await supabase
    .from('tenants')
    .select('business_name')
    .eq('id', user.id)
    .single()
  if (tenant?.business_name) tenantName = tenant.business_name

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-inter)]">
      <Sidebar tenantName={tenantName} userEmail={user.email || ''} />
      <div className="lg:pl-64">
        {/* Spacer for mobile top bar */}
        <div className="lg:hidden h-14" />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
