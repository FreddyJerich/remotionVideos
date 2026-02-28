import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default withAuth(
    function middleware(req: NextRequest) {
        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: '/admin/login',
        },
    }
)

// 只匹配 /admin 下面的路径，但排除 /admin/login
export const config = {
    matcher: ['/admin/((?!login).*)'],
}
