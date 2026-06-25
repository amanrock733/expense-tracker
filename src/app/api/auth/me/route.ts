import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/session'

export async function GET(_req: NextRequest) {
  const auth = await getAuthUser(_req)
  if ('error' in auth) return auth.error
  return NextResponse.json({ user: auth.user })
}
