import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { reviews } = await req.json()
  if (!reviews || !Array.isArray(reviews) || reviews.length === 0) {
    return NextResponse.json({ error: '口コミデータが必要です' }, { status: 400 })
  }

  const db = getDb()
  const stmt = db.prepare('INSERT INTO reviews (course_id, content) VALUES (?, ?)')
  const insertMany = db.transaction((items: string[]) => {
    for (const content of items) {
      if (content.trim()) {
        stmt.run(params.id, content.trim())
      }
    }
  })

  insertMany(reviews)
  return NextResponse.json({ success: true, count: reviews.filter((r: string) => r.trim()).length }, { status: 201 })
}
