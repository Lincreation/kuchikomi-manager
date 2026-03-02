import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    // 管理画面へのアクセス制御
    if (pathname.startsWith('/admin') && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }

    // 管理API へのアクセス制御
    if (
      pathname.startsWith('/api/') &&
      !pathname.startsWith('/api/auth/') &&
      req.method !== 'GET' &&
      !pathname.endsWith('/use')
    ) {
      if (token?.role !== 'admin' && !pathname.endsWith('/use')) {
        return NextResponse.json({ error: '権限がありません' }, { status: 403 })
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // ログインページと認証APIは誰でもアクセス可能
        const { pathname } = req.nextUrl
        if (pathname === '/login' || pathname.startsWith('/api/auth/')) {
          return true
        }
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
