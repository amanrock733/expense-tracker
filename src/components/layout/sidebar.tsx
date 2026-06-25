'use client'

import {
  LayoutDashboard,
  ArrowLeftRight,
  FileText,
  User,
  Wallet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore, type ViewKey } from '@/store/app-store'

const navItems: Array<{ key: ViewKey; label: string; icon: typeof LayoutDashboard }> = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
  { key: 'reports', label: 'Reports', icon: FileText },
  { key: 'profile', label: 'Profile', icon: User },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const view = useAppStore((s) => s.view)
  const setView = useAppStore((s) => s.setView)

  function handleClick(key: ViewKey) {
    setView(key)
    onClose()
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 border-r bg-background transition-transform duration-200 md:static md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Wallet className="h-4 w-4" />
          </div>
          <span className="font-semibold">Smart Expense</span>
        </div>

        <nav className="space-y-1 p-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = view === item.key
            return (
              <button
                key={item.key}
                onClick={() => handleClick(item.key)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 border-t p-4">
          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Tip</p>
            <p className="mt-1 leading-relaxed">
              Use filters &amp; search to find transactions quickly. Export your monthly report as PDF or Excel.
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}
