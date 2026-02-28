import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (credentials?.password === process.env.ADMIN_PASSWORD) {
                    return { id: '1', name: 'Admin', email: 'admin@local' }
                }
                return null
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: '/admin/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
}
