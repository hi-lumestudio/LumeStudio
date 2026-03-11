'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User, KeyRound, Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'

interface UserInfo {
  email: string
  tenantId: string
  tenantName: string
  createdAt: string
}

export default function SettingsPage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [loading, setLoading] = useState(true)

  // Password change state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  useEffect(() => {
    async function fetchUser() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setUserInfo({
          email: user.email || '',
          tenantId: user.user_metadata?.tenant_id || 'default',
          tenantName: user.user_metadata?.tenant_name || 'The Little Bean',
          createdAt: user.created_at,
        })
      }
      setLoading(false)
    }

    fetchUser()
  }, [])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    setChangingPassword(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      toast.error(error.message || 'Failed to change password')
    } else {
      toast.success('Password changed successfully')
      setNewPassword('')
      setConfirmPassword('')
    }
    setChangingPassword(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
          <User className="w-5 h-5 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Account Information</h2>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoField label="Email address" value={userInfo?.email || '—'} />
            <InfoField label="Tenant ID" value={userInfo?.tenantId || '—'} mono />
            <InfoField label="Business Name" value={userInfo?.tenantName || '—'} />
            <InfoField
              label="Account created"
              value={
                userInfo?.createdAt
                  ? new Date(userInfo.createdAt).toLocaleDateString('en-MY', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '—'
              }
            />
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
          <KeyRound className="w-5 h-5 text-gray-500" />
          <h2 className="font-semibold text-gray-900">Change Password</h2>
        </div>
        <form onSubmit={handleChangePassword} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              New password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              minLength={6}
              required
              autoComplete="new-password"
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              minLength={6}
              required
              autoComplete="new-password"
              className="w-full h-10 px-3 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
            />
          </div>
          <div className="pt-1">
            <button
              type="submit"
              disabled={changingPassword || !newPassword || !confirmPassword}
              className="flex items-center gap-2 h-10 px-5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {changingPassword ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {changingPassword ? 'Saving...' : 'Save new password'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger zone note */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 px-6 py-4">
        <p className="text-sm text-gray-500">
          Need to add more users or change tenant settings? Contact your Lume Studio administrator.
        </p>
      </div>
    </div>
  )
}

function InfoField({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-sm text-gray-900 ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  )
}
