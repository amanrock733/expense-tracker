import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/session'
import { updateTransactionSchema, validate } from '@/lib/validations'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser(req)
  if ('error' in auth) return auth.error
  const { user } = auth
  const { id } = await params

  const tx = await db.transaction.findFirst({
    where: { id, userId: user.id },
  })
  if (!tx) {
    return NextResponse.json({ message: 'Transaction not found' }, { status: 404 })
  }
  return NextResponse.json({ transaction: tx })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser(req)
  if ('error' in auth) return auth.error
  const { user } = auth
  const { id } = await params

  try {
    const body = await req.json()
    const result = validate(updateTransactionSchema, body)
    if (!result.success) {
      return NextResponse.json(
        { message: 'Validation failed', errors: result.errors },
        { status: 400 }
      )
    }

    const existing = await db.transaction.findFirst({
      where: { id, userId: user.id },
    })
    if (!existing) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 })
    }

    const updateData: any = { ...result.data }
    if (updateData.date) updateData.date = new Date(updateData.date)
    if (updateData.description === undefined) delete updateData.description

    const tx = await db.transaction.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ message: 'Transaction updated', transaction: tx })
  } catch (err) {
    console.error('[transactions PUT] error', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser(req)
  if ('error' in auth) return auth.error
  const { user } = auth
  const { id } = await params

  const existing = await db.transaction.findFirst({
    where: { id, userId: user.id },
  })
  if (!existing) {
    return NextResponse.json({ message: 'Transaction not found' }, { status: 404 })
  }

  await db.transaction.delete({ where: { id } })
  return NextResponse.json({ message: 'Transaction deleted' })
}
