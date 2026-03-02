import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function GET() {
  const db = getDb()
  const users = db
    .prepare('SELECT id, email, name, role, created_at FROM users ORDER BY created_at DESC')
    .all()
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const { email, password, name, role } = await req.json()
  if (!email || !password || !name) {
    return NextResponse.json({ error: '必須項目を入力してください' }, { status: 400 })
  }

  const db = getDb()
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email)
  if (existing) {
    return NextResponse.json({ error: 'このメールアドレスは既に登録されています' }, { status: 409 })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const result = db
    .prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)')
    .run(email, hashedPassword, name, role || 'user')
  return NextResponse.json({ id: result.lastInsertRowid }, { status: 201 })
}
