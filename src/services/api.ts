// Client-side API service layer.
// All routes use relative paths so they work behind the gateway.

import type { AppUser, Transaction, Pagination, Filters } from '@/store/app-store'

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  })

  let data: any = null
  try {
    data = await res.json()
  } catch {
    // ignore JSON parse errors
  }

  if (!res.ok) {
    const message = data?.message || `Request failed (${res.status})`
    const err = new Error(message) as Error & {
      status: number
      errors?: Record<string, string>
    }
    err.status = res.status
    err.errors = data?.errors
    throw err
  }

  return data as T
}

// --- Auth ---
export const authApi = {
  register: (body: {
    name: string
    email: string
    password: string
    confirmPassword: string
  }) =>
    request<{ message: string; user: AppUser }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ message: string; user: AppUser }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  logout: () =>
    request<{ message: string }>('/api/auth/logout', { method: 'POST' }),

  me: () => request<{ user: AppUser }>('/api/auth/me'),
}

// --- Transactions ---
export interface TransactionPayload {
  title: string
  amount: number
  category: string
  type: 'income' | 'expense'
  date: string
  description?: string
}

export interface TransactionsQuery extends Partial<Filters> {
  search?: string
  page?: number
  pageSize?: number
}

export const transactionApi = {
  list: (q: TransactionsQuery) => {
    const params = new URLSearchParams()
    if (q.search) params.set('search', q.search)
    if (q.category && q.category !== 'all') params.set('category', q.category)
    if (q.type && q.type !== 'all') params.set('type', q.type)
    if (q.dateFilter) params.set('dateFilter', q.dateFilter)
    if (q.startDate) params.set('startDate', q.startDate)
    if (q.endDate) params.set('endDate', q.endDate)
    if (q.sortField) params.set('sortField', q.sortField)
    if (q.sortOrder) params.set('sortOrder', q.sortOrder)
    params.set('page', String(q.page || 1))
    params.set('pageSize', String(q.pageSize || 10))
    return request<{
      transactions: Transaction[]
      pagination: Pagination
    }>(`/api/transactions?${params.toString()}`)
  },

  get: (id: string) =>
    request<{ transaction: Transaction }>(`/api/transactions/${id}`),

  create: (body: TransactionPayload) =>
    request<{ message: string; transaction: Transaction }>(
      '/api/transactions',
      { method: 'POST', body: JSON.stringify(body) }
    ),

  update: (id: string, body: Partial<TransactionPayload>) =>
    request<{ message: string; transaction: Transaction }>(
      `/api/transactions/${id}`,
      { method: 'PUT', body: JSON.stringify(body) }
    ),

  delete: (id: string) =>
    request<{ message: string }>(`/api/transactions/${id}`, {
      method: 'DELETE',
    }),
}

// --- Reports ---
export interface MonthlyReport {
  period: { year: number; month: number; monthName: string }
  summary: {
    totalIncome: number
    totalExpense: number
    netSavings: number
    savingsPercent: number
    totalTransactions: number
    highestExpenseCategory: { category: string; amount: number } | null
  }
  categoryBreakdown: Record<string, number>
  transactions: Transaction[]
}

export interface YearlyReport {
  period: { year: number }
  summary: {
    totalIncome: number
    totalExpense: number
    netSavings: number
    savingsPercent: number
    totalTransactions: number
    highestExpenseCategory: { category: string; amount: number } | null
  }
  monthly: Array<{
    month: string
    monthIndex: number
    income: number
    expense: number
    savings: number
    transactions: number
  }>
  categoryBreakdown: Record<string, number>
}

export const reportApi = {
  monthly: (year: number, month: number) =>
    request<MonthlyReport>(
      `/api/reports/monthly?year=${year}&month=${month}`
    ),
  yearly: (year: number) =>
    request<YearlyReport>(`/api/reports/yearly?year=${year}`),
}

// --- Profile ---
export const profileApi = {
  get: () =>
    request<{ user: AppUser & { joinedDate: string; totalTransactions: number } }>(
      '/api/profile'
    ),
  update: (body: { name?: string; monthlyBudget?: number }) =>
    request<{ message: string; user: AppUser }>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(body),
    }),
}
