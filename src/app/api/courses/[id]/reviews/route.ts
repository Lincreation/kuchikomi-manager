import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDb()
  const reviews = db
    .prepare(`
      SELECT r.*, u.name as used_by_name
      FROM reviews r
      LEFT JOIN users u ON r.used_by = u.id
      WHERE r.course_id = ?
      ORDER BY r.status ASC, r.created_at ASC
    `)
    .all(params.id)

  const course = db.prepare('SELECT * FROM courses WHERE id = ?').get(params.id)

  return NextResponse.json({ course, reviews })
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { content } = await req.json()
  if (!content) {
    return NextResponse.json({ error: '口コミ内容は必須です' }, { status: 400 })
  }
  const db = getDb()
  const result = db
    .prepare('INSERT INTO reviews (course_id, content) VALUES (?, ?)')
    .run(params.id, content)
  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 })
}
