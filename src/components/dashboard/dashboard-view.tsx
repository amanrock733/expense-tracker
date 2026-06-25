'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SummaryCards } from './summary-cards'
import { BudgetAlert } from './budget-alert'
import { PieChart } from '@/components/charts/pie-chart'
import { BarChart } from '@/components/charts/bar-chart'
import { LineChart } from '@/components/charts/line-chart'
import { TransactionTable } from '@/components/transactions/transaction-table'
import { TransactionForm } from '@/components/transactions/transaction-form'
import { useAppStore, type Transaction } from '@/store/app-store'
import { reportApi } from '@/services/api'
import { calcSavingsPercent, formatCurrency } from '@/lib/format'

export function DashboardView() {
  const user = useAppStore((s) => s.user)
  const setView = useAppStore((s) => s.setView)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)

  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()

  const yearlyQuery = useQuery({
    queryKey: ['reports', 'yearly', year],
    queryFn: () => reportApi.yearly(year),
  })

  const monthlyQuery = useQuery({
    queryKey: ['reports', 'monthly', year, month],
    queryFn: () => reportApi.monthly(year, month),
  })

  const { totalIncome, totalExpense, balance, savingsPercent, monthlyExpense } = useMemo(() => {
    const ys = yearlyQuery.data?.summary
    const ms = monthlyQuery.data?.summary
    const income = ys?.totalIncome || 0
    const expense = ys?.totalExpense || 0
    return {
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
      savingsPercent: calcSavingsPercent(income, income - expense),
      monthlyExpense: ms?.totalExpense || 0,
    }
  }, [yearlyQuery.data, monthlyQuery.data])

  const pieData = useMemo(() => {
    const breakdown = yearlyQuery.data?.categoryBreakdown || {}
    return Object.entries(breakdown)
      .map(([name, value]) => ({ name, value: value as number }))
      .sort((a, b) => b.value - a.value)
  }, [yearlyQuery.data])

  const barData = useMemo(() => {
    return (yearlyQuery.data?.monthly || []).map((m) => ({
      month: m.month,
      expense: m.expense,
      income: m.income,
    }))
  }, [yearlyQuery.data])

  const lineData = useMemo(() => {
    return (yearlyQuery.data?.monthly || []).map((m) => ({
      month: m.month,
      savings: m.savings,
    }))
  }, [yearlyQuery.data])

  const recentTx = useMemo(() => {
    return monthlyQuery.data?.transactions.slice(0, 5) || []
  }, [monthlyQuery.data])

  function handleEdit(tx: Transaction) {
    setEditing(tx)
    setFormOpen(true)
  }

  function handleAdd() {
    setEditing(null)
    setFormOpen(true)
  }

  const loading = yearlyQuery.isLoading || monthlyQuery.isLoading

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Hello, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Here&apos;s your financial overview for {now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}.
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Summary cards */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <SummaryCards
          income={totalIncome}
          expense={totalExpense}
          balance={balance}
          savingsPercent={savingsPercent}
        />
      )}

      {/* Budget alert */}
      {user?.monthlyBudget && user.monthlyBudget > 0 && (
        <BudgetAlert spent={monthlyExpense} budget={user.monthlyBudget} />
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Expense Distribution</CardTitle>
            <CardDescription>By category, year-to-date</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <PieChart data={pieData} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Income vs Expense</CardTitle>
            <CardDescription>{year} overview</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <BarChart data={barData} />
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Savings Trend</CardTitle>
            <CardDescription>Monthly net savings across {year}</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <LineChart data={lineData} />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Recent Transactions</CardTitle>
            <CardDescription>Your latest activity this month</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView('transactions')}
            className="text-emerald-600 hover:text-emerald-700"
          >
            View all
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent>
          <TransactionTable
            loading={monthlyQuery.isLoading}
            transactions={recentTx}
            onEdit={handleEdit}
          />
        </CardContent>
      </Card>

      <TransactionForm
        open={formOpen}
        onOpenChange={setFormOpen}
        editing={editing}
      />
    </div>
  )
}
