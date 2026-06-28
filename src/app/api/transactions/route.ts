import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/session'
import { transactionSchema, validate } from '@/lib/validations'
import { getDateRange, type DateFilter } from '@/lib/format'

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req)
  if ('error' in auth) return auth.error
  const { user } = auth

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const type = searchParams.get('type') || ''
  const dateFilter = (searchParams.get('dateFilter') || 'all') as DateFilter
  const customStart = searchParams.get('startDate') || undefined
  const customEnd = searchParams.get('endDate') || undefined
  const sortField = searchParams.get('sortField') || 'date'
  const sortOrder = searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const pageSize = Math.max(
    1,
    Math.min(100, parseInt(searchParams.get('pageSize') || '10', 10))
  )

  const where: any = { userId: user.id }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { category: { contains: search } },
      { description: { contains: search } },
    ]
  }
  if (category && category !== 'all') where.category = category
  if (type && (type === 'income' || type === 'expense')) where.type = type

  const range = getDateRange(dateFilter, customStart, customEnd)
  if (range.start || range.end) {
    where.date = {}
    if (range.start) where.date.gte = range.start
    if (range.end) where.date.lte = range.end
  }

  const allowedSortFields = ['date', 'amount', 'title', 'category', 'createdAt']
  const sortBy = allowedSortFields.includes(sortField) ? sortField : 'date'
  const orderBy: any = { [sortBy]: sortOrder }

  const [total, transactions] = await Promise.all([
    db.transaction.count({ where }),
    db.transaction.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ])

  return NextResponse.json({
    transactions,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  })
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req)
  if ('error' in auth) return auth.error
  const { user } = auth

  if (process.env.NEXT_PUBLIC_IS_DEMO === 'true') {
    return NextResponse.json({ message: 'Action disabled in Demo Mode' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const result = validate(transactionSchema, body)
    if (!result.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: result.errors },
        { status: 400 }
      )
    }

    const { title, amount, category, type, date, description } = result.data

    const tx = await db.transaction.create({
      data: {
        userId: user.id,
        title,
        amount,
        category,
        type,
        date: new Date(date),
        description: description || null,
      },
    })

    return NextResponse.json({ message: 'Transaction created', transaction: tx }, { status: 201 })
  } catch (err) {
    console.error('[transactions POST] error', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
