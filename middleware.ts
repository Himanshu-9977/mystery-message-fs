import { NextRequest, NextResponse } from 'next/server'
import type { NextRequest as TNextRequest } from 'next/server'
export {default} from "next-auth/middleware"
import { getToken } from 'next-auth/jwt'
 
export async function middleware(request: TNextRequest) {
    const token = await getToken({ req: request })
    const url = request.nextUrl

    if(token && (url.pathname.startsWith('/sign-in') || url.pathname.startsWith('/sign-up') || url.pathname === '/')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if(!token && url.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/sign-in', request.url))
    }
}
 
// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/sign-in',
    '/sign-up',
    '/',
    '/dashboard:path*',
    '/verify/:path*',
  ],
}