'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Header from '@/components/Header'

interface Course {
  id: number
  name: string
  description: string
  total_reviews: number
  available_reviews: number
}

interface User {
  id: number
  email: string
  name: string
  role: string
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<'courses' | 'users'>('courses')
  const [courses, setCourses] = useState<Course[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  // 講座フォーム
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [courseName, setCourseName] = useState('')
  const [courseDesc, setCourseDesc] = useState('')

  // ユーザーフォーム
  const [showUserForm, setShowUserForm] = useState(false)
  const [userName, setUserName] = useState('')
  const [userEmail, setUserEmail] = useState('')
  const [userPassword, setUserPassword] = useState('')
  const [userRole, setUserRole] = useState('user')

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      if (session?.user.role !== 'admin') router.push('/')
      fetchAll()
    }
  }, [status])

  const fetchAll = async () => {
    const [coursesRes, usersRes] = await Promise.all([
      fetch('/api/courses'),
      fetch('/api/users'),
    ])
    setCourses(await coursesRes.json())
    setUsers(await usersRes.json())
    setLoading(false)
  }

  // 講座CRUD
  const handleSaveCourse = async () => {
    if (!courseName.trim()) return
    if (editingCourse) {
      await fetch(`/api/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: courseName, description: courseDesc }),
      })
    } else {
      await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: courseName, description: courseDesc }),
      })
    }
    resetCourseForm()
    fetchAll()
  }

  const handleDeleteCourse = async (id: number) => {
    if (!confirm('この講座を削除しますか？関連する口コミもすべて削除されます。')) return
    await fetch(`/api/courses/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  const startEditCourse = (course: Course) => {
    setEditingCourse(course)
    setCourseName(course.name)
    setCourseDesc(course.description)
    setShowCourseForm(true)
  }

  const resetCourseForm = () => {
    setShowCourseForm(false)
    setEditingCourse(null)
    setCourseName('')
    setCourseDesc('')
  }

  // ユーザーCRUD
  const handleSaveUser = async () => {
    if (!userName.trim() || !userEmail.trim() || !userPassword.trim()) return
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userName,
        email: userEmail,
        password: userPassword,
        role: userRole,
      }),
    })
    if (!res.ok) {
      const data = await res.json()
      alert(data.error || 'エラーが発生しました')
      return
    }
    resetUserForm()
    fetchAll()
  }

  const handleDeleteUser = async (id: number) => {
    if (!confirm('このユーザーを削除しますか？')) return
    await fetch(`/api/users/${id}`, { method: 'DELETE' })
    fetchAll()
  }

  const handleChangeRole = async (id: number, role: string) => {
    await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    fetchAll()
  }

  const resetUserForm = () => {
    setShowUserForm(false)
    setUserName('')
    setUserEmail('')
    setUserPassword('')
    setUserRole('user')
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-bold text-gray-800">管理画面</h2>
        </div>

        {/* タブ */}
        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setTab('courses')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === 'courses'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            講座管理
          </button>
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === 'users'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            ユーザー管理
          </button>
        </div>

        {/* 講座管理 */}
        {tab === 'courses' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-gray-500">{courses.length} 件の講座</p>
              <button
                onClick={() => { resetCourseForm(); setShowCourseForm(true) }}
                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700"
              >
                + 講座追加
              </button>
            </div>

            {/* 講座追加/編集フォーム */}
            {showCourseForm && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  {editingCourse ? '講座を編集' : '新しい講座を追加'}
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="講座名"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="text"
                    placeholder="説明（任意）"
                    value={courseDesc}
                    onChange={(e) => setCourseDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveCourse}
                      className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      保存
                    </button>
                    <button
                      onClick={resetCourseForm}
                      className="text-sm text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 講座一覧 */}
            <div className="space-y-2">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">{course.name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        口コミ: {course.available_reviews ?? 0} / {course.total_reviews ?? 0} 件
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/courses/${course.id}`)}
                        className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1"
                      >
                        口コミ管理
                      </button>
                      <button
                        onClick={() => startEditCourse(course)}
                        className="text-xs text-gray-600 hover:text-gray-800 px-2 py-1"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="text-xs text-red-600 hover:text-red-800 px-2 py-1"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ユーザー管理 */}
        {tab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <p className="text-sm text-gray-500">{users.length} 人のユーザー</p>
              <button
                onClick={() => { resetUserForm(); setShowUserForm(true) }}
                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700"
              >
                + ユーザー追加
              </button>
            </div>

            {/* ユーザー追加フォーム */}
            {showUserForm && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">新しいユーザーを追加</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="名前"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="email"
                    placeholder="メールアドレス"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <input
                    type="text"
                    placeholder="パスワード"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="user">一般ユーザー</option>
                    <option value="admin">管理者</option>
                  </select>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveUser}
                      className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      追加
                    </button>
                    <button
                      onClick={resetUserForm}
                      className="text-sm text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ユーザー一覧 */}
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-white border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-800">{user.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {user.role === 'admin' ? '管理者' : 'ユーザー'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        className="text-xs border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="user">ユーザー</option>
                        <option value="admin">管理者</option>
                      </select>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-xs text-red-600 hover:text-red-800 px-2 py-1"
                        disabled={String(user.id) === session?.user.id}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
