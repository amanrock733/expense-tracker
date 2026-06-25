'use client'

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'

interface SummaryCardsProps {
  income: number
  expense: number
  balance: number
  savingsPercent: number
}

export function SummaryCards({
  income,
  expense,
  balance,
  savingsPercent,
}: SummaryCardsProps) {
  const cards = [
    {
      label: 'Total Income',
      value: formatCurrency(income),
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
    },
    {
      label: 'Total Expense',
      value: formatCurrency(expense),
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/50',
    },
    {
      label: 'Current Balance',
      value: formatCurrency(balance),
      icon: Wallet,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/50',
    },
    {
      label: 'Savings',
      value: `${savingsPercent.toFixed(1)}%`,
      icon: PiggyBank,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/50',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.label} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold tracking-tight">
                    {card.value}
                  </p>
                </div>
                <div className={`rounded-lg p-2.5 ${card.bg}`}>
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
