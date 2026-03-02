import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = getDb()
  const courses = db
    .prepare(`
      SELECT c.*,
        COUNT(r.id) as total_reviews,
        SUM(CASE WHEN r.status = 'available' THEN 1 ELSE 0 END) as available_reviews
      FROM courses c
      LEFT JOIN reviews r ON c.id = r.course_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `)
    .all()
  return NextResponse.json(courses)
}

export async function POST(req: NextRequest) {
  const { name, description } = await req.json()
  if (!name) {
    return NextResponse.json({ error: '講座名は必須です' }, { status: 400 })
  }
  const db = getDb()
  const result = db
    .prepare('INSERT INTO courses (name, description) VALUES (?, ?)')
    .run(name, description || '')
  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 })
}
