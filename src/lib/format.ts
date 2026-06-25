// Currency formatting (₹ INR per spec)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount || 0)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-IN').format(num || 0)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatMonth(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-IN', {
    month: 'short',
    year: 'numeric',
  })
}

// Safe savings % - handles income=0
export function calcSavingsPercent(income: number, balance: number): number {
  if (!income || income === 0) return 0
  return (balance / income) * 100
}

// Budget alert levels
export type BudgetLevel = 'safe' | 'warning' | 'high' | 'exceeded'

export function getBudgetLevel(spent: number, budget: number): {
  level: BudgetLevel
  percent: number
  message: string
} {
  if (!budget || budget === 0) {
    return { level: 'safe', percent: 0, message: 'No budget set' }
  }
  const percent = (spent / budget) * 100
  if (percent >= 100) {
    return {
      level: 'exceeded',
      percent,
      message: `Budget exceeded! Spent ${percent.toFixed(0)}% of budget`,
    }
  }
  if (percent >= 90) {
    return {
      level: 'high',
      percent,
      message: `High Warning: ${percent.toFixed(0)}% budget consumed`,
    }
  }
  if (percent >= 80) {
    return {
      level: 'warning',
      percent,
      message: `Warning: ${percent.toFixed(0)}% budget consumed`,
    }
  }
  return {
    level: 'safe',
    percent,
    message: `${percent.toFixed(0)}% budget consumed`,
  }
}

// Date range helpers (timezone-aware)
export function getStartOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function getEndOfToday(): Date {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d
}

export function getStartOfWeek(): Date {
  const d = new Date()
  const day = d.getDay() // 0 = Sunday
  const diff = d.getDate() - day
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getStartOfMonth(): Date {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

export function getStartOfYear(): Date {
  const d = new Date(new Date().getFullYear(), 0, 1)
  d.setHours(0, 0, 0, 0)
  return d
}

export type DateFilter =
  | 'today'
  | 'week'
  | 'month'
  | 'year'
  | 'custom'
  | 'all'

export function getDateRange(
  filter: DateFilter,
  customStart?: string,
  customEnd?: string
): { start?: Date; end?: Date } {
  const end = getEndOfToday()
  switch (filter) {
    case 'today':
      return { start: getStartOfToday(), end }
    case 'week':
      return { start: getStartOfWeek(), end }
    case 'month':
      return { start: getStartOfMonth(), end }
    case 'year':
      return { start: getStartOfYear(), end }
    case 'custom':
      return {
        start: customStart ? new Date(customStart) : undefined,
        end: customEnd ? new Date(customEnd + 'T23:59:59.999') : undefined,
      }
    case 'all':
    default:
      return {}
  }
}

// Month name from number (0-indexed)
export function monthName(monthIndex: number): string {
  const d = new Date(2000, monthIndex, 1)
  return d.toLocaleDateString('en-IN', { month: 'short' })
}
