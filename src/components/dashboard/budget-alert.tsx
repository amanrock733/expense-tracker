'use client'

import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { formatCurrency, getBudgetLevel } from '@/lib/format'

interface BudgetAlertProps {
  spent: number
  budget: number
}

export function BudgetAlert({ spent, budget }: BudgetAlertProps) {
  const { level, percent, message } = getBudgetLevel(spent, budget)

  if (!budget || budget === 0) {
    return null
  }

  const config = {
    safe: {
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      border: 'border-emerald-200 dark:border-emerald-900',
      bar: 'bg-emerald-500',
    },
    warning: {
      icon: AlertCircle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-900',
      bar: 'bg-amber-500',
    },
    high: {
      icon: AlertTriangle,
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950/40',
      border: 'border-orange-200 dark:border-orange-900',
      bar: 'bg-orange-500',
    },
    exceeded: {
      icon: AlertTriangle,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/40',
      border: 'border-red-200 dark:border-red-900',
      bar: 'bg-red-500',
    },
  }[level]

  const Icon = config.icon

  return (
    <Card className={cn('border', config.border)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={cn('rounded-lg p-2.5', config.bg)}>
              <Icon className={cn('h-5 w-5', config.color)} />
            </div>
            <div>
              <p className="font-semibold">{message}</p>
              <p className="text-sm text-muted-foreground">
                Spent {formatCurrency(spent)} of {formatCurrency(budget)}
              </p>
            </div>
          </div>
          <div className={cn('text-right text-sm font-bold', config.color)}>
            {Math.min(percent, 100).toFixed(0)}%
          </div>
        </div>
        <Progress
          value={Math.min(percent, 100)}
          className={cn('mt-4 h-2', config.bar)}
        />
      </CardContent>
    </Card>
  )
}
