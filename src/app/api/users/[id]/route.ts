import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDb()
  db.prepare('DELETE FROM users WHERE id = ?').run(params.id)
  return NextResponse.json({ success: true })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { role } = await req.json()
  if (!role || !['admin', 'user'].includes(role)) {
    return NextResponse.json({ error: '無効なロールです' }, { status: 400 })
  }
  const db = getDb()
  db.prepare('UPDATE users SET role = ? WHERE id = ?').run(role, params.id)
  return NextResponse.json({ success: true })
}
