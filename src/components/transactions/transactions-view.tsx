'use client'

import { useEffect, useState, useCallback } from 'react'
import { Plus, ArrowLeft, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FiltersBar } from '@/components/transactions/filters'
import { TransactionTable } from '@/components/transactions/transaction-table'
import { TransactionForm } from '@/components/transactions/transaction-form'
import { useAppStore, type Transaction } from '@/store/app-store'
import { transactionApi } from '@/services/api'
import { useDebounce } from '@/hooks/use-debounce'

export function TransactionsView() {
  const {
    transactions,
    pagination,
    transactionsLoading,
    setTransactions,
    setPagination,
    setTransactionsLoading,
    upsertTransaction,
    removeTransaction,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    resetFilters,
  } = useAppStore()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  const debouncedSearch = useDebounce(searchTerm, 500)

  const loadTransactions = useCallback(async () => {
    setTransactionsLoading(true)
    try {
      const { transactions: txs, pagination: pg } = await transactionApi.list({
        search: debouncedSearch || undefined,
        ...filters,
        page,
        pageSize,
      })
      setTransactions(txs)
      setPagination(pg)
    } catch (err) {
      console.error(err)
    } finally {
      setTransactionsLoading(false)
    }
  }, [
    debouncedSearch,
    filters.dateFilter,
    filters.category,
    filters.type,
    filters.startDate,
    filters.endDate,
    filters.sortField,
    filters.sortOrder,
    page,
    pageSize,
  ])

  useEffect(() => {
    loadTransactions()
  }, [loadTransactions])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [
    debouncedSearch,
    filters.dateFilter,
    filters.category,
    filters.type,
    filters.startDate,
    filters.endDate,
  ])

  function handleEdit(tx: Transaction) {
    setEditing(tx)
    setFormOpen(true)
  }

  function handleAdd() {
    setEditing(null)
    setFormOpen(true)
  }

  function handleSort(field: typeof filters.sortField) {
    if (filters.sortField === field) {
      setFilters({
        sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
      })
    } else {
      setFilters({ sortField: field, sortOrder: 'asc' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">
            Search, filter, sort, edit and delete all your transactions.
          </p>
        </div>
        <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FiltersBar
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          {transactionsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <TransactionTable
              loading={false}
              transactions={transactions}
              onEdit={handleEdit}
            />
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, pagination.total)} of {pagination.total}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ArrowLeft className="mr-1 h-3.5 w-3.5" />
                  Prev
                </Button>
                <span className="flex h-8 items-center px-3 text-sm font-medium">
                  {page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                >
                  Next
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
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
