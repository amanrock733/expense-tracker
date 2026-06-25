import { create } from 'zustand'
import type { DateFilter } from '@/lib/format'

export type ViewKey = 'dashboard' | 'transactions' | 'reports' | 'profile'

export interface AppUser {
  id: string
  name: string
  email: string
  monthlyBudget: number
  darkMode: boolean
  joinedDate?: string
  totalTransactions?: number
}

export interface Transaction {
  id: string
  userId: string
  title: string
  amount: number
  category: string
  type: 'income' | 'expense'
  date: string
  description?: string | null
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface Filters {
  dateFilter: DateFilter
  category: string
  type: string
  startDate?: string
  endDate?: string
  sortField: 'date' | 'amount' | 'title' | 'category'
  sortOrder: 'asc' | 'desc'
}

interface AppState {
  user: AppUser | null
  authLoading: boolean
  setUser: (u: AppUser | null) => void
  setAuthLoading: (b: boolean) => void

  view: ViewKey
  setView: (v: ViewKey) => void

  transactions: Transaction[]
  pagination: Pagination
  transactionsLoading: boolean
  setTransactions: (t: Transaction[]) => void
  setPagination: (p: Pagination) => void
  setTransactionsLoading: (b: boolean) => void
  upsertTransaction: (t: Transaction) => void
  removeTransaction: (id: string) => void

  searchTerm: string
  setSearchTerm: (s: string) => void
  filters: Filters
  setFilters: (f: Partial<Filters>) => void
  resetFilters: () => void

  darkMode: boolean
  setDarkMode: (b: boolean) => void
  toggleDarkMode: () => void
}

const defaultFilters: Filters = {
  dateFilter: 'all',
  category: 'all',
  type: 'all',
  startDate: undefined,
  endDate: undefined,
  sortField: 'date',
  sortOrder: 'desc',
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  authLoading: true,
  setUser: (u) => set({ user: u }),
  setAuthLoading: (b) => set({ authLoading: b }),

  view: 'dashboard',
  setView: (v) => set({ view: v }),

  transactions: [],
  pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
  transactionsLoading: false,
  setTransactions: (t) => set({ transactions: t }),
  setPagination: (p) => set({ pagination: p }),
  setTransactionsLoading: (b) => set({ transactionsLoading: b }),
  upsertTransaction: (t) =>
    set((state) => {
      const exists = state.transactions.some((x) => x.id === t.id)
      const transactions = exists
        ? state.transactions.map((x) => (x.id === t.id ? t : x))
        : [t, ...state.transactions]
      return { transactions }
    }),
  removeTransaction: (id) =>
    set((state) => ({
      transactions: state.transactions.filter((x) => x.id !== id),
    })),

  searchTerm: '',
  setSearchTerm: (s) => set({ searchTerm: s }),
  filters: defaultFilters,
  setFilters: (f) => set((state) => ({ filters: { ...state.filters, ...f } })),
  resetFilters: () => set({ filters: defaultFilters }),

  darkMode: false,
  setDarkMode: (b) => set({ darkMode: b }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
}))
