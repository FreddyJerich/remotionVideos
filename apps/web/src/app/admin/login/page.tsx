'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const res = await signIn('credentials', {
            password,
            redirect: false,
        })

        setLoading(false)
        if (res?.ok) {
            router.push('/admin')
        } else {
            setError('密码错误')
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
        }}>

            <div className="card animate-fade-in-up" style={{ width: 400, position: 'relative' }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 16,
                        background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 28, margin: '0 auto 16px',
                    }}>
                        ⚡
                    </div>
                    <h1 style={{ fontSize: 24, fontWeight: 700 }}>管理后台</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 14 }}>
                        输入密码登录
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <input
                        type="password"
                        className="input"
                        placeholder="管理员密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoFocus
                    />

                    {error && (
                        <div style={{
                            background: 'rgba(239,68,68,0.1)',
                            border: '1px solid rgba(239,68,68,0.3)',
                            borderRadius: 8,
                            padding: '10px 14px',
                            color: '#f87171',
                            fontSize: 14,
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading}
                        style={{ justifyContent: 'center', padding: '12px' }}
                    >
                        {loading ? <span className="animate-spin">⟳</span> : '登录'}
                    </button>
                </form>
            </div>
        </div>
    )
}
