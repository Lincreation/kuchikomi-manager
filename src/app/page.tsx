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

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCourses()
    }
    if (status !== 'loading') {
      setLoading(false)
    }
  }, [status])

  const fetchCourses = async () => {
    const res = await fetch('/api/courses')
    const data = await res.json()
    setCourses(data)
    setLoading(false)
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
        <h2 className="text-lg font-bold text-gray-800 mb-4">講座一覧</h2>

        {courses.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <p className="text-gray-500">講座がまだありません</p>
            {session?.user.role === 'admin' && (
              <button
                onClick={() => router.push('/admin')}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800"
              >
                管理画面で講座を作成する
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-3">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => router.push(`/courses/${course.id}`)}
                className="bg-white rounded-lg border border-gray-200 p-4 text-left hover:border-blue-300 hover:shadow-sm transition-all active:scale-[0.99]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-800 truncate">
                      {course.name}
                    </h3>
                    {course.description && (
                      <p className="text-sm text-gray-500 mt-0.5 truncate">
                        {course.description}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-blue-600">
                      {course.available_reviews ?? 0}
                    </p>
                    <p className="text-xs text-gray-400">
                      / {course.total_reviews ?? 0} 件
                    </p>
                  </div>
                </div>

                {course.total_reviews > 0 && (
                  <div className="mt-3 bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full rounded-full transition-all"
                      style={{
                        width: `${((course.available_reviews ?? 0) / course.total_reviews) * 100}%`,
                      }}
                    />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
