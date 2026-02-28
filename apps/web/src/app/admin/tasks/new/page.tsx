'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewTaskPage() {
    const router = useRouter()
    const [title, setTitle] = useState('')
    const [category, setCategory] = useState('physics')
    const [style, setStyle] = useState<'cosmic' | 'bright' | 'minimal'>('cosmic')

    const [loadingAI, setLoadingAI] = useState(false)
    const [loadingMsg, setLoadingMsg] = useState('')
    const [error, setError] = useState('')

    // AI 生成的结果
    const [generatedProps, setGeneratedProps] = useState<any>(null)
    const [audioUrl, setAudioUrl] = useState('')

    // 提交渲染状态
    const [rendering, setRendering] = useState(false)

    const handleGenerateAI = async () => {
        if (!title.trim()) {
            setError('请输入视频标题')
            return
        }
        setError('')
        setLoadingAI(true)
        setGeneratedProps(null)
        setAudioUrl('')

        try {
            // 第 1 步：生成脚本
            setLoadingMsg('🧠 正在调用大模型构思视频脚本...')
            const scriptRes = await fetch('/api/generate-script', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, category, style }),
            })
            const scriptData = await scriptRes.json()
            if (!scriptRes.ok) throw new Error(scriptData.error || '生成脚本失败')

            const script = scriptData.script
            const voiceScript = script.voiceScript
            const taskId = `task-${Date.now()}`

            // 第 2 步：生成配音
            setLoadingMsg('🎤 正在使用 Edge TTS 生成专业配音...')
            const ttsRes = await fetch('/api/generate-tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: voiceScript, taskId }),
            })
            const ttsData = await ttsRes.json()
            if (!ttsRes.ok) throw new Error(ttsData.error || '生成配音失败')

            setAudioUrl(ttsData.audioUrl)

            // 组装最终 Props
            const finalProps = {
                title,
                style,
                totalSeconds: script.totalSeconds || 60,
                scenes: script.scenes,
                audioUrl: ttsData.audioUrl,
                subtitles: ttsData.subtitles || [],
            }
            setGeneratedProps(finalProps)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoadingAI(false)
            setLoadingMsg('')
        }
    }

    const handleSubmitRender = async () => {
        if (!generatedProps) return

        setRendering(true)
        setError('')

        try {
            const res = await fetch('/api/trigger-render', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    description: `AI 生成的 ${category} 视频`,
                    composition: 'AIGeneratedVideo',
                    category,
                    tags: 'AI生成',
                    props: generatedProps,
                }),
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error ?? '提交渲染失败')

            // 渲染在后台执行，直接跳转到管理列表
            router.push('/admin?renderStarted=1')
        } catch (err: any) {
            setError(err.message)
            setRendering(false)
        }
    }

    return (
        <div className="animate-fade-in-up" style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, background: 'linear-gradient(to right, #a78bfa, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                ✨ AI 一键生成科教视频
            </h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 36, fontSize: 15 }}>
                只需输入标题，AI 自动完成：策划知识脚本 → 生成流式分镜 → 合成专业配音 → 云端离线渲染
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
                {/* 左侧：输入控制区 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="card">
                        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#818cf8' }}>设定主题</h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>视频标题 *</label>
                                <input
                                    className="input"
                                    placeholder="输入任意科学概念，例如：黑洞的形成"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    // 禁用如果正在加载
                                    disabled={loadingAI || rendering}
                                    style={{ fontSize: 16, padding: '12px 16px' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>学科分类</label>
                                    <select className="input" value={category} onChange={e => setCategory(e.target.value)} disabled={loadingAI || rendering}>
                                        <option value="physics">🌌 物理</option>
                                        <option value="chemistry">🧪 化学</option>
                                        <option value="biology">🧬 生物</option>
                                        <option value="math">📐 数学</option>
                                        <option value="astronomy">🔭 天文</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>视觉风格</label>
                                    <select className="input" value={style} onChange={e => setStyle(e.target.value as any)} disabled={loadingAI || rendering}>
                                        <option value="cosmic">🚀 深邃宇宙</option>
                                        <option value="bright">☀️ 明亮课堂</option>
                                        <option value="minimal">⚪ 极简白板</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                className="btn btn-primary"
                                onClick={handleGenerateAI}
                                disabled={loadingAI || rendering || !title.trim()}
                                style={{ marginTop: 8, padding: '14px', fontSize: 16, width: '100%', justifyContent: 'center' }}
                            >
                                {loadingAI ? <><span className="animate-spin" style={{ display: 'inline-block' }}>⟳</span> {loadingMsg}</> : '✨ 一键生成脚本与配音'}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '16px', color: '#f87171' }}>
                            ❌ {error}
                        </div>
                    )}
                </div>

                {/* 右侧：预览与渲染区 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="card" style={{ minHeight: 380, display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: '#4ade80', display: 'flex', justifyContent: 'space-between' }}>
                            <span>📋 脚本与配音预览</span>
                            {generatedProps && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>总时长: {generatedProps.totalSeconds}秒</span>}
                        </h2>

                        {!generatedProps && !loadingAI ? (
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 14, textAlign: 'center' }}>
                                👈 在左侧输入标题并点击生成<br />AI 会在这里展示策划的视频场景分镜
                            </div>
                        ) : loadingAI ? (
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                                <div className="animate-spin" style={{ fontSize: 40, color: '#818cf8' }}>✺</div>
                                <div style={{ color: '#a1a1aa' }}>AI 正在燃烧脑细胞思考...</div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1, overflowY: 'auto' }}>
                                {/* 音频预览 */}
                                {audioUrl && (
                                    <div style={{ background: '#1e1e2e', padding: 12, borderRadius: 8, border: '1px solid #333' }}>
                                        <div style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 8 }}>🔊 配音试听</div>
                                        <audio controls src={audioUrl} style={{ width: '100%', height: 32 }} />
                                    </div>
                                )}

                                {/* 分镜列表 */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    <div style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 4 }}>🎞️ 场景分镜 ({generatedProps.scenes.length} 幕)</div>
                                    {generatedProps.scenes.map((s: any, i: number) => (
                                        <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: 8, padding: 12, display: 'flex', gap: 12 }}>
                                            <div style={{ fontSize: 24 }}>{s.icon || '🎬'}</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>
                                                    {s.heading || s.title} <span style={{ color: '#71717a', fontSize: 12, fontWeight: 400 }}>· {s.durationSeconds}s</span>
                                                </div>
                                                <div style={{ fontSize: 12, color: '#a1a1aa' }}>
                                                    {s.type === 'title' && s.sub}
                                                    {s.type === 'concept' && s.body}
                                                    {s.type === 'formula' && <span style={{ color: '#f87171', fontFamily: 'monospace' }}>{s.formula}</span>}
                                                    {s.type === 'comparison' && `${s.leftLabel} vs ${s.rightLabel}`}
                                                    {s.type === 'conclusion' && `总结 ${s.points?.length} 个要点`}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* 渲染按钮组 */}
                    {generatedProps && (
                        <div className="card animate-fade-in-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmitRender}
                                disabled={rendering}
                                style={{ padding: '16px', fontSize: 16, justifyContent: 'center', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}
                            >
                                {rendering ? <><span className="animate-spin" style={{ display: 'inline-block' }}>⟳</span> 正在提交云端渲染队列...</> : '🚀 确认并提交渲染任务'}
                            </button>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                                提交后系统将在后台静默合成视频
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
