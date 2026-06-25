'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Navbar } from './navbar'
import { Sidebar } from './sidebar'
import { DashboardView } from '@/components/dashboard/dashboard-view'
import { TransactionsView } from '@/components/transactions/transactions-view'
import { ReportsView } from '@/components/reports/reports-view'
import { ProfileView } from '@/components/profile/profile-view'
import { AuthView } from '@/components/auth/auth-view'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/store/app-store'
import { authApi } from '@/services/api'
import { useTheme } from 'next-themes'

export function AppShell() {
  const { user, authLoading, setUser, setAuthLoading, view, darkMode, setDarkMode } =
    useAppStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { setTheme } = useTheme()

  // Bootstrap session on mount
  const meQuery = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authApi.me(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (meQuery.isSuccess) {
      setUser(meQuery.data.user)
      setAuthLoading(false)
    } else if (meQuery.isError) {
      setUser(null)
      setAuthLoading(false)
    }
  }, [meQuery.isSuccess, meQuery.isError, meQuery.data, setUser, setAuthLoading])

  // Sync dark mode from user profile to theme on login only
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem('expense-theme')
      if (!stored) {
        setTheme(user.darkMode ? 'dark' : 'light')
      }
      setDarkMode(user.darkMode)
    }
  }, [user?.id, setTheme, setDarkMode])

  if (authLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Skeleton className="h-16 w-full rounded-none" />
        <div className="flex flex-1">
          <Skeleton className="hidden w-64 md:block" />
          <div className="flex-1 space-y-4 p-6">
            <Skeleton className="h-10 w-64" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 w-full" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthView />
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex flex-1">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-x-hidden p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {view === 'dashboard' && <DashboardView />}
            {view === 'transactions' && <TransactionsView />}
            {view === 'reports' && <ReportsView />}
            {view === 'profile' && <ProfileView />}
          </div>
        </main>
      </div>
    </div>
  )
}
