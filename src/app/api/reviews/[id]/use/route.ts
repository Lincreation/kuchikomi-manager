import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDb } from '@/lib/db'

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
  }

  const db = getDb()

  // 既に使用済みかチェック
  const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(params.id) as any
  if (!review) {
    return NextResponse.json({ error: '口コミが見つかりません' }, { status: 404 })
  }
  if (review.status === 'used') {
    return NextResponse.json({ error: 'この口コミは既に使用されています' }, { status: 409 })
  }

  db.prepare(
    'UPDATE reviews SET status = ?, used_by = ?, used_at = CURRENT_TIMESTAMP WHERE id = ? AND status = ?'
  ).run('used', session.user.id, params.id, 'available')

  return NextResponse.json({ success: true })
}
