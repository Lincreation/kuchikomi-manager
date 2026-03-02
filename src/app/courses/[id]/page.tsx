'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
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

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

export default function CourseReviewsPage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<Course | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showUsed, setShowUsed] = useState(false)
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastIdRef = useRef(0)

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = ++toastIdRef.current
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000)
  }, [])

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${params.id}/reviews`)
      if (!res.ok) return
      const data = await res.json()
      setCourse(data.course)
      setReviews(data.reviews)
    } catch {}
    setLoading(false)
  }, [params.id])

  // 初回ロード
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // 改善2: 10秒ごとにポーリングで自動更新
  useEffect(() => {
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [fetchData])

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
        return true
      }
    } catch {}
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      document.body.appendChild(textarea)
      textarea.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(textarea)
      return ok
    } catch {
      return false
    }
  }

  const handleCopy = async (review: Review) => {
    if (review.status === 'used') return

    const copied = await copyToClipboard(review.content)

    try {
      const res = await fetch(`/api/reviews/${review.id}/use`, { method: 'POST' })

      if (!res.ok) {
        const data = await res.json()
        if (res.status === 409) {
          addToast('この口コミは他のユーザーに使用されました', 'error')
          await fetchData()
          return
        }
        addToast(data.error || 'エラーが発生しました', 'error')
        return
      }

      setCopiedId(review.id)
      setTimeout(() => setCopiedId(null), 2000)

      if (copied) {
        addToast('コピーしました', 'success')
      } else {
        addToast('使用済みにしました（手動でコピーしてください）', 'info')
      }

      await fetchData()
    } catch {
      addToast('エラーが発生しました', 'error')
    }
  }

  const availableReviews = reviews.filter((r) => r.status === 'available')
  const displayReviews = showUsed ? reviews : availableReviews

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-8">
      <Header />

      {/* トースト通知 */}
      <div className="fixed top-16 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-2.5 rounded-lg shadow-lg text-sm font-medium animate-slide-in ${
              toast.type === 'success'
                ? 'bg-green-600 text-white'
                : toast.type === 'error'
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-white'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <main className="max-w-4xl mx-auto px-4 py-4">
        {/* 戻るボタン + 講座名 */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.push('/')}
            className="text-gray-500 hover:text-gray-700 p-1 -ml-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-800">{course?.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-gray-500">
                残り {availableReviews.length} / {reviews.length} 件
              </p>
              {reviews.length > 0 && (
                <div className="flex-1 max-w-[120px] bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(availableReviews.length / reviews.length) * 100}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => setShowUsed(false)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              !showUsed
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            使用可能 ({availableReviews.length})
          </button>
          <button
            onClick={() => setShowUsed(true)}
            className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
              showUsed
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            すべて ({reviews.length})
          </button>
        </div>

        {/* 空状態 */}
        {displayReviews.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">
              {showUsed ? '口コミがありません' : '使用可能な口コミがありません'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {showUsed ? '管理者が口コミを追加するのをお待ちください' : 'すべての口コミが使用済みです'}
            </p>
          </div>
        ) : (
          <>
            {/* モバイル: カードレイアウト */}
            <div className="sm:hidden space-y-2">
              {displayReviews.map((review, index) => (
                <div
                  key={review.id}
                  className={`bg-white rounded-lg border p-4 transition-all ${
                    review.status === 'used'
                      ? 'border-gray-100 opacity-60'
                      : copiedId === review.id
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-xs text-gray-400 font-mono mt-0.5 flex-shrink-0 w-5 text-right">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm leading-relaxed ${
                          review.status === 'used'
                            ? 'line-through text-gray-400'
                            : 'text-gray-800'
                        }`}
                      >
                        {review.content}
                      </p>
                      {review.status === 'used' && review.used_by_name && (
                        <p className="text-xs text-gray-400 mt-1.5">
                          {review.used_by_name} が使用
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0">
                      {review.status === 'available' ? (
                        <button
                          onClick={() => handleCopy(review)}
                          className={`copy-btn text-xs px-4 py-2 rounded-lg font-medium ${
                            copiedId === review.id
                              ? 'bg-green-500 text-white'
                              : 'bg-blue-600 text-white active:bg-blue-700'
                          }`}
                        >
                          {copiedId === review.id ? 'OK!' : 'コピー'}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 px-2">済</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PC: テーブルレイアウト */}
            <div className="hidden sm:block bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="spreadsheet-table">
                  <thead>
                    <tr>
                      <th className="w-10 text-center">#</th>
                      <th>口コミ内容</th>
                      <th className="w-20 text-center">状態</th>
                      <th className="w-24 text-center">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayReviews.map((review, index) => (
                      <tr
                        key={review.id}
                        className={`${review.status === 'used' ? 'used' : ''} ${
                          copiedId === review.id ? '!bg-green-50' : ''
                        }`}
                      >
                        <td className="text-center text-gray-400 text-xs">
                          {index + 1}
                        </td>
                        <td>
                          <p
                            className={`text-sm leading-relaxed ${
                              review.status === 'used'
                                ? 'line-through text-gray-400'
                                : 'text-gray-800'
                            }`}
                          >
                            {review.content}
                          </p>
                          {review.status === 'used' && review.used_by_name && (
                            <p className="text-xs text-gray-400 mt-1">
                              {review.used_by_name} が使用
                            </p>
                          )}
                        </td>
                        <td className="text-center">
                          {review.status === 'available' ? (
                            <span className="inline-block w-2 h-2 bg-green-500 rounded-full" />
                          ) : (
                            <span className="inline-block w-2 h-2 bg-gray-300 rounded-full" />
                          )}
                        </td>
                        <td className="text-center">
                          {review.status === 'available' ? (
                            <button
                              onClick={() => handleCopy(review)}
                              className={`copy-btn text-xs px-3 py-1.5 rounded-md font-medium ${
                                copiedId === review.id
                                  ? 'bg-green-500 text-white'
                                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100 active:bg-blue-200'
                              }`}
                            >
                              {copiedId === review.id ? 'OK!' : 'コピー'}
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">済</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
