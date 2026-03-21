import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  // Verify admin
  const authClient = createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Fetch proofs with tenant business name
  const { data: proofs, error } = await supabase
    .from('payment_proofs')
    .select('*, tenants(business_name)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Flatten tenant name
  const result = (proofs || []).map((p: any) => ({
    ...p,
    business_name: p.tenants?.business_name || 'Unknown',
    tenants: undefined,
  }))

  return NextResponse.json(result)
}
