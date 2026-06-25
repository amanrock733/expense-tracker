import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comparePassword, signToken, setAuthCookie } from '@/lib/auth'
import { loginSchema, validate } from '@/lib/validations'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = validate(loginSchema, body)

    if (!result.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: result.errors },
        { status: 400 }
      )
    }

    const { email, password } = result.data

    const user = await db.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const ok = await comparePassword(password, user.password)
    if (!ok) {
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      )
    }

    const token = await signToken({ userId: user.id, email: user.email })
    const res = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        monthlyBudget: user.monthlyBudget,
        darkMode: user.darkMode,
      },
    })
    setAuthCookie(res, token)
    return res
  } catch (err) {
    console.error('[login] error', err)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
