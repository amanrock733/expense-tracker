import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/session'
import { monthName } from '@/lib/format'

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req)
  if ('error' in auth) return auth.error
  const { user } = auth

  const { searchParams } = new URL(req.url)
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()), 10)

  const start = new Date(year, 0, 1, 0, 0, 0, 0)
  const end = new Date(year, 11, 31, 23, 59, 59, 999)

  const transactions = await db.transaction.findMany({
    where: { userId: user.id, date: { gte: start, lte: end } },
    orderBy: { date: 'asc' },
  })

  // Group by month
  const monthly: Array<{
    month: string
    monthIndex: number
    income: number
    expense: number
    savings: number
    transactions: number
  }> = Array.from({ length: 12 }, (_, i) => ({
    month: monthName(i),
    monthIndex: i,
    income: 0,
    expense: 0,
    savings: 0,
    transactions: 0,
  }))

  for (const t of transactions) {
    const m = new Date(t.date).getMonth()
    if (t.type === 'income') monthly[m].income += t.amount
    else monthly[m].expense += t.amount
    monthly[m].transactions += 1
  }
  for (const m of monthly) m.savings = m.income - m.expense

  const totalIncome = monthly.reduce((s, m) => s + m.income, 0)
  const totalExpense = monthly.reduce((s, m) => s + m.expense, 0)
  const netSavings = totalIncome - totalExpense
  const savingsPercent = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0

  // Category breakdown for the year
  const byCategory: Record<string, number> = {}
  for (const t of transactions) {
    if (t.type === 'expense') {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount
    }
  }
  const sortedCategories = Object.entries(byCategory).sort((a, b) => b[1] - a[1])
  const highestCategory = sortedCategories[0]
    ? { category: sortedCategories[0][0], amount: sortedCategories[0][1] }
    : null

  return NextResponse.json({
    period: { year },
    summary: {
      totalIncome,
      totalExpense,
      netSavings,
      savingsPercent,
      totalTransactions: transactions.length,
      highestExpenseCategory: highestCategory,
    },
    monthly,
    categoryBreakdown: byCategory,
  })
}
