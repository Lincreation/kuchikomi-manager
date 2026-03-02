import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = getDb()
  db.prepare(
    'UPDATE reviews SET status = ?, used_by = NULL, used_at = NULL WHERE id = ?'
  ).run('available', params.id)
  return NextResponse.json({ success: true })
}
