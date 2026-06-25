'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { User, Mail, Calendar, ArrowLeftRight, Wallet, Save, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { profileApi } from '@/services/api'
import { formatCurrency, formatDate } from '@/lib/format'
import { toast } from 'sonner'

export function ProfileView() {
  const { user, setUser, setView } = useAppStore()
  const qc = useQueryClient()

  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.get(),
    enabled: !!user,
  })

  const [name, setName] = useState(user?.name || '')
  const [budget, setBudget] = useState(String(user?.monthlyBudget || 0))
  const [saving, setSaving] = useState(false)

  // Sync local state when query loads
  const profileUser = profileQuery.data?.user
  if (profileUser && profileUser.name !== name && name === '') {
    setName(profileUser.name)
    setBudget(String(profileUser.monthlyBudget || 0))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const budgetNum = parseFloat(budget)
      if (isNaN(budgetNum) || budgetNum < 0) {
        toast.error('Please enter a valid budget')
        setSaving(false)
        return
      }
      const { user: updated } = await profileApi.update({
        name: name.trim(),
        monthlyBudget: budgetNum,
      })
      setUser(updated)
      qc.invalidateQueries({ queryKey: ['profile'] })
      qc.invalidateQueries({ queryKey: ['reports'] })
      toast.success('Profile updated')
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg lg:col-span-2" />
        </div>
      </div>
    )
  }

  const u = profileQuery.data?.user

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your account details and monthly budget.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile info card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center pb-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-2xl font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {(u?.name || 'U')
                  .split(' ')
                  .map((p) => p[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>
              <p className="mt-3 font-semibold">{u?.name}</p>
              <p className="text-sm text-muted-foreground">{u?.email}</p>
            </div>

            <InfoRow icon={User} label="Name" value={u?.name || '—'} />
            <InfoRow icon={Mail} label="Email" value={u?.email || '—'} />
            <InfoRow
              icon={Calendar}
              label="Joined"
              value={u?.joinedDate ? formatDate(u.joinedDate) : '—'}
            />
            <InfoRow
              icon={ArrowLeftRight}
              label="Total Transactions"
              value={String(u?.totalTransactions || 0)}
            />
            <InfoRow
              icon={Wallet}
              label="Monthly Budget"
              value={formatCurrency(u?.monthlyBudget || 0)}
            />
          </CardContent>
        </Card>

        {/* Update form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Update Profile</CardTitle>
            <CardDescription>
              Update your name and monthly budget. Budget alerts will use this value.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">Full Name</Label>
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  type="email"
                  value={u?.email || ''}
                  disabled
                  className="bg-muted/50"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile-budget">Monthly Budget (₹)</Label>
                <Input
                  id="profile-budget"
                  type="number"
                  step="0.01"
                  min="0"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 10000"
                />
                <p className="text-xs text-muted-foreground">
                  Budget alerts trigger at 80%, 90%, and 100%.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setView('dashboard')}
                >
                  Back to Dashboard
                </Button>
                <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                  {saving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User
  label: string
  value: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b pb-3 last:border-0 last:pb-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <span className="text-sm font-medium">{value}</span>
    </div>
  )
}
