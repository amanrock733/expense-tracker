import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/session'

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req)
  if ('error' in auth) return auth.error
  const { user } = auth

  const { searchParams } = new URL(req.url)
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()), 10)
  const month = parseInt(searchParams.get('month') || String(new Date().getMonth()), 10) // 0-indexed

  const start = new Date(year, month, 1, 0, 0, 0, 0)
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999)

  const transactions = await db.transaction.findMany({
    where: { userId: user.id, date: { gte: start, lte: end } },
    orderBy: { date: 'desc' },
  })

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  const balance = income - expense
  const savingsPercent = income > 0 ? (balance / income) * 100 : 0

  // Highest expense category
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
    period: { year, month, monthName: new Date(year, month, 1).toLocaleDateString('en-IN', { month: 'long' }) },
    summary: {
      totalIncome: income,
      totalExpense: expense,
      netSavings: balance,
      savingsPercent,
      totalTransactions: transactions.length,
      highestExpenseCategory: highestCategory,
    },
    categoryBreakdown: byCategory,
    transactions,
  })
}
