import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/session'
import { profileSchema, validate } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req)
  if ('error' in auth) return auth.error
  const { user } = auth

  const fullUser = await db.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      monthlyBudget: true,
      darkMode: true,
      createdAt: true,
      _count: { select: { transactions: true } },
    },
  })

  if (!fullUser) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 })
  }

  return NextResponse.json({
    user: {
      id: fullUser.id,
      name: fullUser.name,
      email: fullUser.email,
      monthlyBudget: fullUser.monthlyBudget,
      darkMode: fullUser.darkMode,
      joinedDate: fullUser.createdAt,
      totalTransactions: fullUser._count.transactions,
    },
  })
}

export async function PUT(req: NextRequest) {
  const auth = await getAuthUser(req)
  if ('error' in auth) return auth.error
  const { user } = auth

  try {
    const body = await req.json()
    const result = validate(profileSchema, body)
    if (!result.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: result.errors },
        { status: 400 }
      )
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: result.data,
      select: {
        id: true,
        name: true,
        email: true,
        monthlyBudget: true,
        darkMode: true,
      },
    })

    return NextResponse.json({ message: 'Profile updated', user: updated })
  } catch (err) {
    console.error('[profile PUT] error', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
