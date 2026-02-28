import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DeleteTaskButton } from './components/DeleteTaskButton'

const STATUS_MAP = {
    PENDING: { label: '等待', class: 'badge-pending', icon: '⏳', color: '#86868b' },
    QUEUED: { label: '排队', class: 'badge-queued', icon: '📋', color: '#3b82f6' },
    RENDERING: { label: '渲染中', class: 'badge-rendering', icon: '⚙️', color: '#f59e0b' },
    UPLOADING: { label: '上传中', class: 'badge-uploading', icon: '☁️', color: '#8b5cf6' },
    COMPLETED: { label: '完成', class: 'badge-completed', icon: '✅', color: '#10b981' },
    FAILED: { label: '失败', class: 'badge-failed', icon: '❌', color: '#ef4444' },
}

function formatDuration(s: number | null) {
    if (!s) return '--:--'
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export default async function AdminPage() {
    const session = await getServerSession(authOptions)
    if (!session) redirect('/admin/login')

    const [tasks, stats] = await Promise.all([
        prisma.videoTask.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
        }),
        prisma.videoTask.groupBy({
            by: ['status'],
            _count: { _all: true },
        }),
    ])

    const statsMap = Object.fromEntries(stats.map((s: any) => [s.status, s._count._all]))
    const totalTasks = tasks.length
    const successRate = totalTasks > 0
        ? Math.round(((statsMap['COMPLETED'] || 0) / totalTasks) * 100)
        : 0

    return (
        <div style={{ minHeight: '100vh', position: 'relative', zIndex: 1, paddingBottom: 100 }}>
            {/* 顶层科技导航 */}
            <nav style={{
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
                background: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                borderBottom: '1px solid var(--border)',
                padding: '0 40px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                height: 60,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                            width: 8, height: 8, borderRadius: '50%', background: '#10b981',
                            boxShadow: '0 0 12px #10b981', animation: 'pulse-dot 2s infinite'
                        }} />
                        <span style={{ fontWeight: 600, fontSize: 16, color: 'var(--text-primary)', letterSpacing: -0.2 }}>
                            渲染调度中心
                        </span>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>
                        Sys._Status: [ONLINE]
                    </div>
                    <div style={{ width: 1, height: 16, background: 'var(--border)' }} />
                    <Link href="/" className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: 12, borderRadius: 100 }}>
                        ← 退出系统
                    </Link>
                </div>
            </nav>

            {/* Dashboard 内容区 */}
            <div style={{ padding: '100px 40px 0', maxWidth: 1400, margin: '0 auto' }}>

                {/* 顶栏控制台与全局操作 */}
                <div className="animate-fade-in-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
                    <div>
                        <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 8 }}>
                            Task Overview
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>
                            实时监控 Remotion 渲染节点，管理云端作业队列。
                        </p>
                    </div>
                    <div>
                        <Link href="/admin/tasks/new" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: 14, borderRadius: 100 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            新建渲染任务
                        </Link>
                    </div>
                </div>

                {/* 科技感监控小组件 Grid */}
                <div className="animate-fade-in-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 20, marginBottom: 40, animationDelay: '0.1s' }}>
                    {/* 左侧：成功率进度大组件 */}
                    <div className="card" style={{ gridColumn: 'span 4', padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>
                            全局渲染成功率
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
                            <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                                {successRate}%
                            </div>
                            <div style={{ color: '#10b981', fontSize: 14, fontWeight: 500, marginBottom: 6 }}>
                                Total {statsMap['COMPLETED'] || 0}
                            </div>
                        </div>
                        <div style={{ width: '100%', height: 6, background: 'rgba(0,0,0,0.05)', borderRadius: 100, overflow: 'hidden' }}>
                            <div style={{ width: `${successRate}%`, height: '100%', background: 'var(--accent-gradient)', borderRadius: 100 }} />
                        </div>
                    </div>

                    {/* 右侧：状态小组件 */}
                    <div style={{ gridColumn: 'span 8', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                        {['RENDERING', 'QUEUED', 'FAILED'].map((status) => {
                            const info = STATUS_MAP[status as keyof typeof STATUS_MAP]
                            const count = statsMap[status] ?? 0
                            return (
                                <div key={status} className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                                            {info.label.toUpperCase()}
                                        </div>
                                        <div style={{ background: `rgba(0,0,0,0.03)`, color: info.color, padding: '4px 8px', borderRadius: 8, fontSize: 12 }}>
                                            {info.icon}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginTop: 12 }}>
                                        {count}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* 数据表列 - Telemetry Board */}
                <div className="card animate-fade-in-up" style={{ padding: 0, overflow: 'visible', animationDelay: '0.2s', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.8)' }}>
                    <div style={{
                        padding: '24px 32px', borderBottom: '1px solid rgba(0,0,0,0.04)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <h2 style={{ fontSize: 16, fontWeight: 600 }}>任务追踪 (Job Telemetry)</h2>
                            <span style={{ fontSize: 12, padding: '2px 8px', background: 'rgba(99,102,241,0.1)', color: 'var(--accent)', borderRadius: 100, fontWeight: 600 }}>Live</span>
                        </div>
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>已加载最新 {tasks.length} 条</span>
                    </div>

                    {tasks.length === 0 ? (
                        <div style={{ padding: '80px', textAlign: 'center' }}>
                            <div style={{ fontSize: 48, filter: 'grayscale(1)', opacity: 0.2, marginBottom: 16 }}>📭</div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>No tasks in the queue.</p>
                        </div>
                    ) : (
                        <div style={{ width: '100%', overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(0,0,0,0.01)', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                                        {['Task Identifier', 'Composition', 'Status / Progress', 'Duration', 'Timestamp', 'Control'].map(h => (
                                            <th key={h} style={{
                                                padding: '16px 32px', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                                                textTransform: 'uppercase', letterSpacing: 1,
                                            }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tasks.map((task: any) => {
                                        const statusInfo = STATUS_MAP[task.status as keyof typeof STATUS_MAP]
                                        return (
                                            <tr key={task.id} className="tech-row">
                                                <td style={{ padding: '20px 32px' }}>
                                                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
                                                        {task.title}
                                                    </div>
                                                    <div style={{ fontSize: 12, fontFamily: 'ui-monospace, monospace', color: 'var(--text-muted)' }}>
                                                        ID: {task.id.split('-')[0]}...
                                                        {task.githubRunUrl && (
                                                            <a href={task.githubRunUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', marginLeft: 8 }}>
                                                                [Log ↗]
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>

                                                <td style={{ padding: '20px 32px' }}>
                                                    <div style={{
                                                        display: 'inline-flex', alignItems: 'center', gap: 6,
                                                        background: 'rgba(0,0,0,0.03)', padding: '4px 10px', borderRadius: 6,
                                                        fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)'
                                                    }}>
                                                        📦 {task.composition}
                                                    </div>
                                                </td>

                                                <td style={{ padding: '20px 32px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                        <span className={`badge ${statusInfo?.class ?? ''}`}>
                                                            {statusInfo?.label ?? task.status}
                                                        </span>
                                                        {task.status === 'RENDERING' && (
                                                            <div style={{ width: 60, height: 4, background: 'rgba(0,0,0,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                                                                <div style={{ width: '50%', height: '100%', background: 'var(--accent)', animation: 'float 2s infinite linear alternate' }} />
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                <td style={{ padding: '20px 32px', fontFamily: 'ui-monospace, monospace', fontSize: 13, color: 'var(--text-primary)' }}>
                                                    {formatDuration(task.duration)}
                                                </td>

                                                <td style={{ padding: '20px 32px', fontSize: 12, color: 'var(--text-secondary)' }}>
                                                    {task.createdAt.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                </td>

                                                <td style={{ padding: '20px 32px' }}>
                                                    {task.videoUrl ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                            <video
                                                                controls
                                                                src={task.videoUrl}
                                                                style={{ width: 180, height: 100, borderRadius: 8, background: '#000', objectFit: 'cover' }}
                                                            />
                                                            <a href={task.videoUrl} download={`${task.title}.mp4`} className="btn btn-secondary" style={{ padding: '4px 12px', fontSize: 11, borderRadius: 100, textAlign: 'center' }}>
                                                                ⬇ 下载
                                                            </a>
                                                        </div>
                                                    ) : task.status === 'FAILED' ? (
                                                        <div style={{ fontSize: 11, color: '#ef4444', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {task.errorMessage || 'Unknown Error'}
                                                        </div>
                                                    ) : (
                                                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Pending...</span>
                                                    )}
                                                    <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                                        <DeleteTaskButton taskId={task.id} />
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
