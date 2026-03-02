'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Header from '@/components/Header'

interface Review {
  id: number
  content: string
  status: string
  used_by: number | null
  used_by_name: string | null
  used_at: string | null
}

interface Course {
  id: number
  name: string
  description: string
}

export default function AdminCourseReviewsPage() {
  const params = useParams()
  const router = useRouter()
  const { status: authStatus } = useSession()
  const [course, setCourse] = useState<Course | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  // 口コミ追加
  const [showAddForm, setShowAddForm] = useState(false)
  const [addMode, setAddMode] = useState<'single' | 'bulk'>('single')
  const [singleContent, setSingleContent] = useState('')
  const [bulkContent, setBulkContent] = useState('')

  // 編集
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    if (authStatus === 'authenticated') fetchData()
    if (authStatus === 'unauthenticated') router.push('/login')
  }, [authStatus, params.id])

  const fetchData = async () => {
    const res = await fetch(`/api/courses/${params.id}/reviews`)
    const data = await res.json()
    setCourse(data.course)
    setReviews(data.reviews)
    setLoading(false)
  }

  const handleAddSingle = async () => {
    if (!singleContent.trim()) return
    await fetch(`/api/courses/${params.id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: singleContent.trim() }),
    })
    setSingleContent('')
    fetchData()
  }

  const handleAddBulk = async () => {
    const lines = bulkContent.split('\n').filter((l) => l.trim())
    if (lines.length === 0) return
    await fetch(`/api/courses/${params.id}/reviews/bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviews: lines }),
    })
    setBulkContent('')
    setShowAddForm(false)
    fetchData()
  }

  const handleEdit = async (id: number) => {
    if (!editContent.trim()) return
    await fetch(`/api/reviews/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editContent.trim() }),
    })
    setEditingId(null)
    setEditContent('')
    fetchData()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('この口コミを削除しますか？')) return
    await fetch(`/api/reviews/${id}`, { method: 'DELETE' })
    fetchData()
  }

  const handleReset = async (id: number) => {
    await fetch(`/api/reviews/${id}/reset`, { method: 'POST' })
    fetchData()
  }

  const handleResetAll = async () => {
    if (!confirm('すべての口コミを未使用に戻しますか？')) return
    const usedReviews = reviews.filter((r) => r.status === 'used')
    await Promise.all(
      usedReviews.map((r) => fetch(`/api/reviews/${r.id}/reset`, { method: 'POST' }))
    )
    fetchData()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    )
  }

  const availableCount = reviews.filter((r) => r.status === 'available').length
  const usedCount = reviews.filter((r) => r.status === 'used').length

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-4">
        {/* ヘッダー */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.push('/admin')}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-800">{course?.name} - 口コミ管理</h2>
            <p className="text-xs text-gray-500">
              使用可能: {availableCount} / 使用済み: {usedCount} / 合計: {reviews.length}
            </p>
          </div>
        </div>

        {/* アクションバー */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => { setShowAddForm(!showAddForm); setAddMode('single') }}
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700"
          >
            + 口コミ追加
          </button>
          <button
            onClick={() => { setShowAddForm(!showAddForm); setAddMode('bulk') }}
            className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-700"
          >
            一括追加
          </button>
          {usedCount > 0 && (
            <button
              onClick={handleResetAll}
              className="text-xs bg-orange-100 text-orange-700 px-3 py-1.5 rounded-md hover:bg-orange-200"
            >
              すべてリセット
            </button>
          )}
        </div>

        {/* 追加フォーム */}
        {showAddForm && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            {addMode === 'single' ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">口コミを追加</h3>
                <textarea
                  value={singleContent}
                  onChange={(e) => setSingleContent(e.target.value)}
                  placeholder="口コミ内容を入力..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-24 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddSingle}
                    className="text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    追加
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-sm text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-800">口コミを一括追加</h3>
                <p className="text-xs text-gray-500">1行に1つの口コミを入力してください</p>
                <textarea
                  value={bulkContent}
                  onChange={(e) => setBulkContent(e.target.value)}
                  placeholder={"この講座は素晴らしかったです！\n講師の説明がわかりやすかった\n実践的で役立つ内容でした"}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-40 resize-none font-mono"
                />
                <p className="text-xs text-gray-500">
                  {bulkContent.split('\n').filter((l) => l.trim()).length} 件の口コミ
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleAddBulk}
                    className="text-sm bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    一括追加
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="text-sm text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 口コミテーブル */}
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">口コミがありません</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="spreadsheet-table">
                <thead>
                  <tr>
                    <th className="w-10 text-center">#</th>
                    <th>口コミ内容</th>
                    <th className="w-20 text-center">状態</th>
                    <th className="w-32 text-center">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review, index) => (
                    <tr
                      key={review.id}
                      className={review.status === 'used' ? 'used' : ''}
                    >
                      <td className="text-center text-gray-400 text-xs">{index + 1}</td>
                      <td>
                        {editingId === review.id ? (
                          <div className="flex gap-2">
                            <textarea
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm resize-none h-16"
                            />
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleEdit(review.id)}
                                className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                              >
                                保存
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="text-xs text-gray-600 px-2 py-1"
                              >
                                取消
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className={`text-sm ${review.status === 'used' ? 'text-gray-400' : 'text-gray-800'}`}>
                              {review.content}
                            </p>
                            {review.used_by_name && (
                              <p className="text-xs text-gray-400 mt-1">
                                {review.used_by_name} が使用
                              </p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          review.status === 'available'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {review.status === 'available' ? '可' : '済'}
                        </span>
                      </td>
                      <td className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setEditingId(review.id)
                              setEditContent(review.content)
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 px-1"
                          >
                            編集
                          </button>
                          {review.status === 'used' && (
                            <button
                              onClick={() => handleReset(review.id)}
                              className="text-xs text-orange-600 hover:text-orange-800 px-1"
                            >
                              戻す
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="text-xs text-red-600 hover:text-red-800 px-1"
                          >
                            削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
