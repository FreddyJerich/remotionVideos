import Link from 'next/link'
import { prisma } from '@/lib/prisma'

async function getPublishedVideos() {
    try {
        return await prisma.videoTask.findMany({
            where: { status: 'COMPLETED' },
            orderBy: { publishedAt: 'desc' },
            take: 20,
            select: {
                id: true,
                title: true,
                description: true,
                category: true,
                thumbnailUrl: true,
                videoUrl: true,
                duration: true,
                viewCount: true,
                publishedAt: true,
            },
        })
    } catch {
        return []
    }
}

function formatDuration(s: number | null) {
    if (!s) return '--'
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
}

function VideoCard({ video }: { video: any }) {
    return (
        <Link href={`/video/${video.id}` as any}>
            <div className="card" style={{ cursor: 'pointer', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* 缩略图区域 */}
                <div style={{
                    aspectRatio: '16/9',
                    borderRadius: 12,
                    background: 'var(--bg-secondary)',
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {video.thumbnailUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={video.thumbnailUrl} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <div style={{
                            width: 56, height: 56, borderRadius: '50%',
                            background: '#ffffff',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 24, paddingLeft: 4,
                            color: 'var(--accent)'
                        }}>
                            ▶
                        </div>
                    )}
                    {video.duration && (
                        <div style={{
                            position: 'absolute', bottom: 8, right: 8,
                            background: 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(4px)',
                            color: '#1d1d1f', fontSize: 11, fontWeight: 600, padding: '3px 8px',
                            borderRadius: '100px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        }}>
                            {formatDuration(video.duration)}
                        </div>
                    )}
                </div>

                {/* 文本信息 */}
                <div>
                    {video.category && (
                        <div style={{
                            display: 'inline-block',
                            color: 'var(--accent)',
                            fontSize: 10,
                            fontWeight: 700,
                            marginBottom: 6,
                            letterSpacing: 0.5,
                        }}>
                            {video.category.toUpperCase()}
                        </div>
                    )}
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4, marginBottom: 4 }}>
                        {video.title}
                    </h3>
                    {video.description && (
                        <p style={{
                            fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5,
                            display: '-webkit-box', WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical', overflow: 'hidden',
                        }}>
                            {video.description}
                        </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }) : ''}
                        </span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {video.viewCount} 次观看
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}

export default async function HomePage() {
    const videos = await getPublishedVideos()

    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
            {/* 极简玻璃态导航 */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                borderBottom: '1px solid var(--border)',
                padding: '0 40px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                height: 60,
                transition: 'all 0.3s ease',
            }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        background: 'var(--accent-gradient)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white'
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                    </div>
                    <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', letterSpacing: -0.2 }}>
                        科教视界
                    </span>
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: 32, fontSize: 13, fontWeight: 500 }}>
                    <Link href="/" style={{ color: 'var(--text-primary)' }}>发现</Link>
                    <Link href="/?category=physics" style={{ color: 'var(--text-secondary)' }}>物理</Link>
                    <Link href="/?category=chemistry" style={{ color: 'var(--text-secondary)' }}>化学</Link>
                    <Link href="/?category=biology" style={{ color: 'var(--text-secondary)' }}>生物</Link>
                    <Link href="/?category=math" style={{ color: 'var(--text-secondary)' }}>数学</Link>
                    <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
                    <Link href="/admin" className="btn btn-secondary" style={{ padding: '6px 16px', fontSize: 12, borderRadius: 100 }}>
                        开发者后台
                    </Link>
                </div>
            </nav>

            {/* Apple 工业风 Hero Section */}
            <header style={{
                padding: '160px 20px 80px',
                textAlign: 'center',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}>
                <div className="animate-fade-in-up" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: 'rgba(99, 102, 241, 0.08)',
                    borderRadius: 100, padding: '6px 14px',
                    fontSize: 12, fontWeight: 600, color: 'var(--accent)',
                    marginBottom: 24, border: '1px solid rgba(99, 102, 241, 0.15)',
                }}>
                    <span style={{ display: 'flex', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />
                    Remotion & AI 引擎驱动
                </div>

                <h1 className="animate-fade-in-up" style={{
                    fontSize: 'clamp(48px, 6vw, 84px)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.05,
                    color: 'var(--text-primary)',
                    marginBottom: 24,
                    animationDelay: '0.1s',
                }}>
                    科学，<span style={{
                        background: 'var(--accent-gradient)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>动起来</span>
                </h1>

                <p className="animate-fade-in-up" style={{
                    fontSize: 'clamp(18px, 2vw, 24px)',
                    color: 'var(--text-secondary)',
                    fontWeight: 400,
                    maxWidth: 680,
                    lineHeight: 1.5,
                    marginBottom: 48,
                    animationDelay: '0.2s',
                    letterSpacing: '-0.01em',
                }}>
                    让抽象的公式与定理化为直观的次世代动画。通过程序化渲染，我们重新定义科普视频的创作方式。
                </p>

                {/* 前卫的视频占位框 (Glassmorphism & Floating) */}
                <div className="animate-fade-in-up animate-float" style={{
                    position: 'relative',
                    width: '100%',
                    maxWidth: 960,
                    aspectRatio: '16/9',
                    borderRadius: 24,
                    background: 'rgba(255,255,255,0.7)',
                    backdropFilter: 'blur(30px) saturate(150%)',
                    border: '1px solid rgba(255,255,255,0.8)',
                    boxShadow: '0 24px 64px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    animationDelay: '0.3s',
                }}>
                    {/* 内发光与反射 */}
                    <div style={{
                        position: 'absolute', top: 0, left: '20%', right: '20%', height: '50%',
                        background: 'radial-gradient(ellipse at top, rgba(255,255,255,0.8) 0%, transparent 70%)',
                        pointerEvents: 'none'
                    }} />

                    {/* 模拟代码流或数据线 */}
                    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.05 }} >
                        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                        </pattern>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                    </svg>

                    <VideoPlayButton />
                </div>
            </header>

            {/* 内容区背景为浅灰区隔 */}
            <div style={{ background: 'var(--bg-secondary)', padding: '100px 40px', borderTop: '1px solid var(--border)' }}>
                <div style={{ maxWidth: 1200, margin: '0 auto' }}>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 40 }}>
                        <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em' }}>最新探索</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#10b981', fontWeight: 600 }}>
                            <span style={{ display: 'block', width: 6, height: 6, borderRadius: '50%', background: 'currentColor', animation: 'pulse-dot 2s infinite' }} />
                            已渲染 {videos.length} 支视频
                        </div>
                    </div>

                    {videos.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '120px 20px',
                            background: '#ffffff', borderRadius: 24, border: '1px solid var(--border)',
                            boxShadow: 'var(--shadow-card)'
                        }}>
                            <div style={{ fontSize: 56, marginBottom: 20, opacity: 0.5 }}>✨</div>
                            <h3 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>计算集群空闲中</h3>
                            <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32 }}>当前没有任何已发布的视频，去后台创建一个试试吧。</p>
                            <Link href="/admin/tasks/new" className="btn btn-primary" style={{ padding: '14px 32px' }}>
                                开始第一次渲染
                            </Link>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24,
                        }}>
                            {videos.map((video: any) => (
                                <VideoCard key={video.id} video={video} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function VideoPlayButton() {
    return (
        <div className="btn-play" style={{
            position: 'relative',
            width: 80, height: 80,
            borderRadius: '50%',
            background: 'var(--accent-gradient)',
            boxShadow: '0 12px 32px rgba(99,102,241,0.4), inset 0 1px 2px rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white" style={{ marginLeft: 4 }}>
                <path d="M5 3l14 9-14 9V3z" />
            </svg>
        </div>
    )
}
