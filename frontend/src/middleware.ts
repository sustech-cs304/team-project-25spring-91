// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || ''
  
  if (request.nextUrl.pathname.startsWith('/dashboard/statistics')) {
    if (!token) {
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }
  }

  if (request.nextUrl.pathname.startsWith('/sign-in')) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard/statistics', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in']
}
