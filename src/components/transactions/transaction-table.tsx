'use client'

import { useState } from 'react'
import { Pencil, Trash2, ArrowDownLeft, ArrowUpRight, Inbox } from 'lucide-react'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/format'
import { transactionApi } from '@/services/api'
import { useAppStore, type Transaction } from '@/store/app-store'

interface TransactionTableProps {
  loading: boolean
  transactions: Transaction[]
  onEdit: (tx: Transaction) => void
}

export function TransactionTable({
  loading,
  transactions,
  onEdit,
}: TransactionTableProps) {
  const removeTransaction = useAppStore((s) => s.removeTransaction)
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function confirmDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await transactionApi.delete(deleteTarget.id)
      removeTransaction(deleteTarget.id)
      toast.success('Transaction deleted')
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete transaction')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!transactions.length) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
        <Inbox className="h-10 w-10 text-muted-foreground/60" />
        <p className="mt-3 text-sm font-medium">No transactions found</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Try adjusting your filters, or add a new transaction.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Date</TableHead>
              <TableHead>Title</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => {
              const isIncome = tx.type === 'income'
              return (
                <TableRow key={tx.id} className="hover:bg-muted/50">
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(tx.date)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'flex h-7 w-7 items-center justify-center rounded-full',
                          isIncome
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                        )}
                      >
                        {isIncome ? (
                          <ArrowDownLeft className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium leading-none">{tx.title}</p>
                        {tx.description && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                            {tx.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline" className="font-normal">
                      {tx.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge
                      variant="secondary"
                      className={cn(
                        isIncome
                          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300'
                      )}
                    >
                      {isIncome ? 'Income' : 'Expense'}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right font-semibold tabular-nums',
                      isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    )}
                  >
                    {isIncome ? '+' : '-'}
                    {formatCurrency(tx.amount)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onEdit(tx)}
                        aria-label="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700"
                        onClick={() => setDeleteTarget(tx)}
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.title}</strong> (
              {formatCurrency(deleteTarget?.amount || 0)}). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
