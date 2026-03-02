import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { name, description } = await req.json()
  if (!name) {
    return NextResponse.json({ error: '講座名は必須です' }, { status: 400 })
  }
  const db = getDb()
  db.prepare('UPDATE courses SET name = ?, description = ? WHERE id = ?').run(
    name,
    description || '',
    params.id
  )
  return NextResponse.json({ success: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDb()
  db.prepare('DELETE FROM courses WHERE id = ?').run(params.id)
  return NextResponse.json({ success: true })
}
