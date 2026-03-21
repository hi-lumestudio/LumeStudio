import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Verify admin
  const authClient = createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const tenantId = params.id

  // Get tenant name
  const { data: tenant } = await supabase
    .from('tenants')
    .select('business_name')
    .eq('id', tenantId)
    .single()

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  }

  // Get current month dates
  const now = new Date()
  const mStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const mEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  // Fetch all dashboard data for this tenant
  const [
    { count: totalCustomers },
    { data: orders },
    { data: costs },
    { data: recentConversations },
    { data: customers },
  ] = await Promise.all([
    supabase.from('customers').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('orders_v2').select('id, customer_phone, order_summary, revenue, created_at, status').eq('tenant_id', tenantId).gte('created_at', mStart).lte('created_at', mEnd + 'T23:59:59').order('created_at', { ascending: false }),
    supabase.from('costs_v2').select('id, amount, date').eq('tenant_id', tenantId).gte('date', mStart).lte('date', mEnd),
    supabase.from('customers').select('phone, name, last_preview, last_contact').eq('tenant_id', tenantId).order('last_contact', { ascending: false }).limit(5),
    supabase.from('customers').select('phone, name').eq('tenant_id', tenantId),
  ])

  const validOrders = orders || []
  const validCosts = costs || []
  const totalRevenue = validOrders.reduce((sum, o) => sum + (Number(o.revenue) || 0), 0)
  const totalCosts = validCosts.reduce((sum, c) => sum + (Number(c.amount) || 0), 0)

  const customerMap: Record<string, string | null> = {}
  ;(customers || []).forEach((c: any) => { if (c.phone) customerMap[c.phone] = c.name })

  return NextResponse.json({
    businessName: tenant.business_name,
    stats: {
      totalCustomers: totalCustomers || 0,
      totalOrders: validOrders.length,
      totalRevenue,
      totalCosts,
    },
    recentOrders: validOrders.slice(0, 5),
    recentConversations: recentConversations || [],
    customerMap,
  })
}
