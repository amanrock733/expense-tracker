import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, signToken, setAuthCookie } from '@/lib/auth'
import { registerSchema, validate } from '@/lib/validations'

export async function POST(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_IS_DEMO === 'true') {
    return NextResponse.json({ message: 'Action disabled in Demo Mode' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const result = validate(registerSchema, body)

    if (!result.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: result.errors },
        { status: 400 }
      )
    }

    const { name, email, password } = result.data

    // Check if user already exists
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { message: 'Email is already registered' },
        { status: 409 }
      )
    }

    const hashed = await hashPassword(password)
    const user = await db.user.create({
      data: { name, email, password: hashed },
      select: {
        id: true,
        name: true,
        email: true,
        monthlyBudget: true,
        darkMode: true,
      },
    })

    const token = await signToken({ userId: user.id, email: user.email })
    const res = NextResponse.json(
      { message: 'Registered successfully', user },
      { status: 201 }
    )
    setAuthCookie(res, token)
    return res
  } catch (err) {
    console.error('[register] error', err)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
