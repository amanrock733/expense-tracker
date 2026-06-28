import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { signToken, setAuthCookie } from '@/lib/auth'

export async function POST() {
  try {
    let user = await db.user.findFirst()

    if (!user) {
      return NextResponse.json(
        { message: 'Demo Mode requires at least one user in the database.' },
        { status: 500 }
      )
    }

    const token = await signToken({ userId: user.id, email: user.email })
    
    const res = NextResponse.json({
      message: 'Demo login successful',
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
    console.error('[demo-login] error', err)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
