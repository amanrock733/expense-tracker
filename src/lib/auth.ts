import { NextRequest, NextResponse } from 'next/server'
import jwt, { type JwtPayload as JwtPayloadType } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret-change-me'
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d'
const COOKIE_NAME = 'expense_token'

export interface JwtPayload {
  userId: string
  email: string
}

/** Hash a password using bcrypt */
export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import('bcryptjs')
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

/** Compare a plaintext password against a hash */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  const bcrypt = await import('bcryptjs')
  return bcrypt.compare(password, hash)
}

/** Sign a JWT for a user */
export async function signToken(payload: JwtPayload): Promise<string> {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRE })
}

/** Verify a JWT and return the payload, or null if invalid */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayloadType
    return {
      userId: (decoded as any).userId,
      email: (decoded as any).email,
    }
  } catch {
    return null
  }
}

/** Set the auth cookie on a NextResponse */
export function setAuthCookie(res: NextResponse, token: string): void {
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

/** Clear the auth cookie */
export function clearAuthCookie(res: NextResponse): void {
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
}

/** Read the auth token from a request cookie */
export function getTokenFromRequest(req: NextRequest): string | undefined {
  return req.cookies.get(COOKIE_NAME)?.value
}

export const AUTH_COOKIE_NAME = COOKIE_NAME
