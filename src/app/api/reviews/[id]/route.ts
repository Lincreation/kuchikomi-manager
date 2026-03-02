import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { content } = await req.json()
  if (!content) {
    return NextResponse.json({ error: '口コミ内容は必須です' }, { status: 400 })
  }
  const db = getDb()
  db.prepare('UPDATE reviews SET content = ? WHERE id = ?').run(content, params.id)
  return NextResponse.json({ success: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDb()
  db.prepare('DELETE FROM reviews WHERE id = ?').run(params.id)
  return NextResponse.json({ success: true })
}
