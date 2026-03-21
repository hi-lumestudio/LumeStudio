'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

// ─── Auth Guard ───────────────────────────────────────────────────────
async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    throw new Error('Unauthorized: admin access required')
  }
  return user
}

// ─── Create New Client (Auth user + Tenant row) ───────────────────────
export async function createNewClient(formData: {
  email: string
  password: string
  businessName: string
  ownerPhone: string
  plan: 'starter' | 'pro'
  wahaSession: string
  openrouterApiKey: string
  aiPrompt: string
  knowledgeBase: string
}) {
  await requireAdmin()
  const supabase = createAdminClient()

  const aiLimit = formData.plan === 'pro' ? 20000 : 7500
  const showWatermark = formData.plan !== 'pro'

  // 1. Create Supabase Auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: formData.email,
    password: formData.password,
    email_confirm: true,
    user_metadata: {
      tenant_name: formData.businessName,
    },
  })

  if (authError) {
    return { success: false, error: `Auth error: ${authError.message}` }
  }

  const userId = authData.user.id

  // 2. Update user_metadata with tenant_id
  await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      tenant_id: userId,
      tenant_name: formData.businessName,
    },
  })

  // 3. Parse knowledge_base JSON
  let parsedKb = {}
  try {
    parsedKb = formData.knowledgeBase.trim() ? JSON.parse(formData.knowledgeBase) : {}
  } catch {
    return { success: false, error: 'Invalid JSON in knowledge base' }
  }

  // 4. INSERT into tenants table
  const { error: tenantError } = await supabase.from('tenants').insert({
    id: userId,
    business_name: formData.businessName,
    plan: formData.plan,
    ai_limit: aiLimit,
    status: 'active',
    knowledge_base: parsedKb,
    ai_prompt: formData.aiPrompt,
    openrouter_api_key: formData.openrouterApiKey,
    waha_session: formData.wahaSession,
    owner_phone: formData.ownerPhone,
    show_watermark: showWatermark,
  })

  if (tenantError) {
    // Cleanup: delete the auth user if tenant insert fails
    await supabase.auth.admin.deleteUser(userId)
    return { success: false, error: `Tenant error: ${tenantError.message}` }
  }

  return {
    success: true,
    userId,
    email: formData.email,
    password: formData.password,
    businessName: formData.businessName,
  }
}

// ─── Update Tenant ────────────────────────────────────────────────────
export async function updateTenant(tenantId: string, updates: Record<string, any>) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('tenants').update(updates).eq('id', tenantId)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ─── Record Payment ───────────────────────────────────────────────────
export async function recordPayment(data: {
  tenantId: string
  amount: number
  paymentDate: string
  periodStart: string
  periodEnd: string
  notes: string
}) {
  await requireAdmin()
  const supabase = createAdminClient()

  const { error } = await supabase.from('admin_payments').insert({
    tenant_id: data.tenantId,
    amount: data.amount,
    payment_date: data.paymentDate,
    period_start: data.periodStart || null,
    period_end: data.periodEnd || null,
    notes: data.notes || null,
  })

  if (error) return { success: false, error: error.message }

  // Also update subscription_end on the tenant if period_end is provided
  if (data.periodEnd) {
    await supabase
      .from('tenants')
      .update({ subscription_end: data.periodEnd })
      .eq('id', data.tenantId)
  }

  return { success: true }
}

// ─── Delete Payment ───────────────────────────────────────────────────
export async function deletePayment(paymentId: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('admin_payments').delete().eq('id', paymentId)
  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ─── Approve Payment Proof ────────────────────────────────────────────
export async function approvePaymentProof(proofId: string, adminNotes?: string) {
  await requireAdmin()
  const supabase = createAdminClient()

  // Get the proof first
  const { data: proof, error: fetchErr } = await supabase
    .from('payment_proofs')
    .select('tenant_id, amount')
    .eq('id', proofId)
    .single()

  if (fetchErr || !proof) return { success: false, error: 'Bukti tidak ditemukan' }

  // Update status
  const { error } = await supabase
    .from('payment_proofs')
    .update({
      status: 'approved',
      admin_notes: adminNotes || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', proofId)

  if (error) return { success: false, error: error.message }

  // Auto-record as a payment in admin_payments
  if (proof.amount) {
    await supabase.from('admin_payments').insert({
      tenant_id: proof.tenant_id,
      amount: proof.amount,
      payment_date: new Date().toISOString().split('T')[0],
      notes: `Dari bukti transfer #${proofId.slice(0, 8)}`,
    })
  }

  return { success: true }
}

// ─── Reject Payment Proof ─────────────────────────────────────────────
export async function rejectPaymentProof(proofId: string, adminNotes?: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('payment_proofs')
    .update({
      status: 'rejected',
      admin_notes: adminNotes || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', proofId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}
