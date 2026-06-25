import { z } from 'zod'

// Categories
export const EXPENSE_CATEGORIES = [
  'Food',
  'Travel',
  'Shopping',
  'Bills',
  'Medical',
  'Education',
  'Entertainment',
] as const

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelancing',
  'Business',
  'Investment',
] as const

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES] as const

export const TRANSACTION_TYPES = ['income', 'expense'] as const

export type TransactionType = (typeof TRANSACTION_TYPES)[number]

export type Category = (typeof ALL_CATEGORIES)[number]

// --- Validation Schemas ---

export const registerSchema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

export const transactionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  amount: z
    .number({ message: 'Amount is required' })
    .positive('Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  type: z.enum(TRANSACTION_TYPES, { message: 'Invalid type' }),
  date: z
    .string()
    .min(1, 'Date is required')
    .refine((d) => {
      const date = new Date(d)
      if (isNaN(date.getTime())) return false
      // Block future dates
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      return date.getTime() <= today.getTime()
    }, 'Future dates are not allowed'),
  description: z.string().max(500, 'Description is too long').optional().nullable(),
})

export const updateTransactionSchema = transactionSchema.partial()

export const profileSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').optional(),
  monthlyBudget: z
    .number()
    .min(0, 'Budget cannot be negative')
    .optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type TransactionInput = z.infer<typeof transactionSchema>
export type ProfileInput = z.infer<typeof profileSchema>

// --- Validation helper ---
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const key = issue.path.join('.') || '_'
    if (!errors[key]) errors[key] = issue.message
  }
  return { success: false, errors }
}
