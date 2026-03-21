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

  // Fetch tenant + stats + usage history in parallel
  const [
    { data: tenant },
    { count: customersCount },
    { count: ordersCount },
    { count: messagesCount },
    { data: usageHistory },
  ] = await Promise.all([
    supabase.from('tenants').select('*').eq('id', tenantId).single(),
    supabase.from('customers').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('orders_v2').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('messages').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('monthly_usage')
      .select('month, ai_responses, total_messages')
      .eq('tenant_id', tenantId)
      .order('month', { ascending: false })
      .limit(6),
  ])

  if (!tenant) {
    return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
  }

  return NextResponse.json({
    tenant,
    stats: {
      customers: customersCount || 0,
      orders: ordersCount || 0,
      messages: messagesCount || 0,
    },
    usageHistory: (usageHistory || []).reverse(),
  })
}
