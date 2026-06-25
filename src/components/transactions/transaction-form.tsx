'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/validations'
import { transactionApi, type TransactionPayload } from '@/services/api'
import { useAppStore, type Transaction } from '@/store/app-store'

interface TransactionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editing?: Transaction | null
}

// Form-level schema: amount is a string from input, validated to be a positive number
const formSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) > 0, 'Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(['income', 'expense']),
  date: z
    .string()
    .min(1, 'Date is required')
    .refine((d) => {
      const date = new Date(d)
      if (isNaN(date.getTime())) return false
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      return date.getTime() <= today.getTime()
    }, 'Future dates are not allowed'),
  description: z.string().max(500, 'Description is too long').optional(),
})

type FormValues = z.infer<typeof formSchema>

export function TransactionForm({
  open,
  onOpenChange,
  editing,
}: TransactionFormProps) {
  const upsertTransaction = useAppStore((s) => s.upsertTransaction)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      amount: '',
      category: '',
      type: 'expense',
      date: new Date().toISOString().slice(0, 10),
      description: '',
    },
  })

  const type = watch('type')

  useEffect(() => {
    if (open) {
      if (editing) {
        reset({
          title: editing.title,
          amount: String(editing.amount),
          category: editing.category,
          type: editing.type,
          date: new Date(editing.date).toISOString().slice(0, 10),
          description: editing.description || '',
        })
      } else {
        reset({
          title: '',
          amount: '',
          category: '',
          type: 'expense',
          date: new Date().toISOString().slice(0, 10),
          description: '',
        })
      }
    }
  }, [open, editing, reset])

  // Reset category if not valid for current type
  useEffect(() => {
    const allowed = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
    const current = watch('category')
    if (current && !allowed.includes(current as any)) {
      setValue('category', '')
    }
  }, [type, setValue, watch])

  async function onSubmit(values: FormValues) {
    setSubmitting(true)
    try {
      const payload: TransactionPayload = {
        title: values.title.trim(),
        amount: parseFloat(values.amount),
        category: values.category,
        type: values.type,
        date: values.date,
        description: values.description?.trim() || undefined,
      }

      if (editing) {
        const { transaction } = await transactionApi.update(editing.id, payload)
        upsertTransaction(transaction)
        toast.success('Transaction updated')
      } else {
        const { transaction } = await transactionApi.create(payload)
        upsertTransaction(transaction)
        toast.success('Transaction added')
      }
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || 'Failed to save transaction')
    } finally {
      setSubmitting(false)
    }
  }

  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
  const today = new Date().toISOString().slice(0, 10)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit Transaction' : 'Add Transaction'}</DialogTitle>
          <DialogDescription>
            {editing
              ? 'Update the details of your transaction.'
              : 'Record a new income or expense entry.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Groceries from Big Bazaar"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                {...register('amount')}
              />
              {errors.amount && (
                <p className="text-xs text-red-500">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                max={today}
                {...register('date')}
              />
              {errors.date && (
                <p className="text-xs text-red-500">{errors.date.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={watch('type')}
                onValueChange={(v) => setValue('type', v as 'income' | 'expense')}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-xs text-red-500">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={watch('category')}
                onValueChange={(v) => setValue('category', v)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-red-500">{errors.category.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Add any extra notes..."
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editing ? 'Save Changes' : 'Add Transaction'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
