import { NextRequest, NextResponse } from 'next/server'
import { getTokenFromRequest, verifyToken } from './auth'
import { db } from './db'

export interface AuthUser {
  id: string
  name: string
  email: string
  monthlyBudget: number
  darkMode: boolean
}

/**
 * Extract & verify the authenticated user from the request cookie.
 * Returns the user (without password) on success, or an error response.
 */
export async function getAuthUser(
  req: NextRequest
): Promise<{ user: AuthUser } | { error: NextResponse }> {
  const token = getTokenFromRequest(req)
  if (!token) {
    return {
      error: NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 }
      ),
    }
  }

  let payload: { userId: string } | null = null

  if (token.startsWith('DEMO_')) {
    // Bypass JWT entirely for Demo Mode
    payload = { userId: token.replace('DEMO_', '') }
  } else {
    payload = await verifyToken(token)
  }

  if (!payload) {
    return {
      error: NextResponse.json(
        { message: 'Invalid or expired token' },
        { status: 401 }
      ),
    }
  }

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      name: true,
      email: true,
      monthlyBudget: true,
      darkMode: true,
    },
  })

  if (!user) {
    return {
      error: NextResponse.json(
        { message: 'User not found' },
        { status: 401 }
      ),
    }
  }

  return { user }
}
