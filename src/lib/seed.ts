import { getDb } from './db'
import bcrypt from 'bcryptjs'

async function seed() {
  const db = getDb()

  // 管理者ユーザー作成
  const hashedPassword = await bcrypt.hash('admin123', 10)
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@example.com')
  if (!existing) {
    db.prepare('INSERT INTO users (email, password, name, role) VALUES (?, ?, ?, ?)').run(
      'admin@example.com',
      hashedPassword,
      '管理者',
      'admin'
    )
    console.log('管理者ユーザーを作成しました: admin@example.com / admin123')
  } else {
    console.log('管理者ユーザーは既に存在します')
  }

  // サンプル講座作成
  const courseExists = db.prepare('SELECT id FROM courses LIMIT 1').get()
  if (!courseExists) {
    db.prepare('INSERT INTO courses (name, description) VALUES (?, ?)').run(
      'サンプル講座',
      'テスト用の講座です'
    )
    console.log('サンプル講座を作成しました')

    const course = db.prepare('SELECT id FROM courses LIMIT 1').get() as { id: number }
    const sampleReviews = [
      'この講座は本当に役立ちました！初心者でもわかりやすい内容で、すぐに実践できました。',
      '講師の説明がとても丁寧で、質問にも親切に答えてくれました。おすすめです。',
      '内容が充実していて、他の講座と比べてコスパが良いと思います。',
      '実践的な演習が多く、スキルが確実に身につきました。',
      '初めての方でも安心して受講できる講座です。サポートも手厚いです。',
    ]
    const stmt = db.prepare('INSERT INTO reviews (course_id, content) VALUES (?, ?)')
    for (const review of sampleReviews) {
      stmt.run(course.id, review)
    }
    console.log(`サンプル口コミを${sampleReviews.length}件作成しました`)
  }

  console.log('シード完了！')
}

seed().catch(console.error)
