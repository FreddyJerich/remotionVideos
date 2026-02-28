import * as React from 'react'
import {
    AbsoluteFill,
    Audio,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
    Series,
    Easing,
    staticFile,
} from 'remotion'
import { z } from 'zod'

// ─── Schema ──────────────────────────────────────────────────────────────────

const sceneSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal('title'),
        durationSeconds: z.number(),
        heading: z.string(),
        sub: z.string().optional(),
    }),
    z.object({
        type: z.literal('concept'),
        durationSeconds: z.number(),
        icon: z.string(),
        title: z.string(),
        body: z.string(),
        highlight: z.string().optional(),
    }),
    z.object({
        type: z.literal('formula'),
        durationSeconds: z.number(),
        icon: z.string().optional(),
        title: z.string(),
        formula: z.string(),
        explanation: z.string().optional(),
    }),
    z.object({
        type: z.literal('comparison'),
        durationSeconds: z.number(),
        icon: z.string().optional(),
        title: z.string(),
        leftLabel: z.string(),
        rightLabel: z.string(),
        body: z.string().optional(),
    }),
    z.object({
        type: z.literal('conclusion'),
        durationSeconds: z.number(),
        icon: z.string().optional(),
        title: z.string(),
        points: z.array(z.string()),
    }),
])

export const aiGeneratedVideoSchema = z.object({
    title: z.string(),
    audioUrl: z.string().optional(),
    subtitles: z.array(z.object({
        text: z.string(),
        start: z.number(),
        end: z.number(),
    })).optional(),
    style: z.enum(['cosmic', 'bright', 'minimal']).default('cosmic'),
    scenes: z.array(sceneSchema),
    totalSeconds: z.number().default(60),
})

export type AIVideoProps = z.infer<typeof aiGeneratedVideoSchema>
type Scene = z.infer<typeof sceneSchema>

// ─── Palette ─────────────────────────────────────────────────────────────────

const PALETTES = {
    cosmic: { bg: '#050814', text: '#f0f0ff', sub: '#a1a1aa', accent: '#a78bfa', secondary: '#60a5fa', warm: '#fbbf24', danger: '#f87171' },
    bright: { bg: '#f8faff', text: '#1a1a2e', sub: '#64748b', accent: '#6366f1', secondary: '#0ea5e9', warm: '#f59e0b', danger: '#ef4444' },
    minimal: { bg: '#ffffff', text: '#111827', sub: '#6b7280', accent: '#374151', secondary: '#6b7280', warm: '#d97706', danger: '#dc2626' },
}

// ─── Shared Components ────────────────────────────────────────────────────────

const StarField: React.FC<{ count?: number }> = ({ count = 60 }) => {
    const frame = useCurrentFrame()
    const { width, height } = useVideoConfig()
    const stars = Array.from({ length: count }, (_, i) => ({
        x: (i * 237.1 + 17) % width,
        y: (i * 91.3 + 53) % height,
        r: 1 + (i % 3) * 0.7,
        op: 0.15 + (Math.sin(frame * 0.018 + i * 2.3) * 0.5 + 0.5) * 0.55,
    }))
    return (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            {stars.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.op} />)}
        </svg>
    )
}

const ProgressBar: React.FC<{ p: typeof PALETTES.cosmic }> = ({ p }) => {
    const frame = useCurrentFrame()
    const { durationInFrames } = useVideoConfig()
    const w = `${(frame / durationInFrames) * 100}%`
    return (
        <AbsoluteFill style={{ top: 'auto', bottom: 0, height: 4 }}>
            <div style={{ height: '100%', width: w, background: `linear-gradient(90deg, ${p.accent}, ${p.secondary})`, boxShadow: `0 0 12px ${p.accent}` }} />
        </AbsoluteFill>
    )
}

function useFadeUp(delay = 0, stiffness = 120) {
    const frame = useCurrentFrame()
    const { fps } = useVideoConfig()
    const f = Math.max(0, frame - delay)
    const sp = spring({ frame: f, fps, config: { damping: 28, stiffness } })
    return { opacity: sp, transform: `translateY(${interpolate(sp, [0, 1], [32, 0])}px)` }
}

const FadeScene: React.FC<{ children: React.ReactNode; frames: number }> = ({ children, frames }) => {
    const frame = useCurrentFrame()
    const FADE = 15
    const fadeIn = interpolate(frame, [0, FADE], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    const fadeOut = interpolate(frame, [frames - FADE, frames], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    return <AbsoluteFill style={{ opacity: Math.min(fadeIn, fadeOut) }}>{children}</AbsoluteFill>
}

// ─── Scene Renderers ──────────────────────────────────────────────────────────

const TitleScene: React.FC<{ scene: Extract<Scene, { type: 'title' }>; p: typeof PALETTES.cosmic; frames: number }> = ({ scene, p, frames }) => {
    const frame = useCurrentFrame()
    const sub = useFadeUp(5)
    const title = useFadeUp(18)
    const pulse = interpolate(frame, [0, 45, 90], [0.5, 1, 0.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin) })
    return (
        <FadeScene frames={frames}>
            <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 20 }}>
                <div style={{ position: 'absolute', width: 560, height: 560, borderRadius: '50%', border: `2px solid ${p.accent}`, opacity: pulse * 0.12, transform: `scale(${1 + pulse * 0.08})` }} />
                <div style={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', border: `1px solid ${p.accent}`, opacity: pulse * 0.18 }} />
                {scene.sub && <div style={{ ...sub, fontSize: 22, color: p.accent, fontWeight: 600, letterSpacing: 5 }}>{scene.sub}</div>}
                <div style={{ ...title, fontSize: 96, fontWeight: 900, color: p.text, textAlign: 'center', lineHeight: 1.1, textShadow: `0 0 80px ${p.accent}66` }}>
                    {scene.heading}
                </div>
            </AbsoluteFill>
        </FadeScene>
    )
}

const ConceptScene: React.FC<{ scene: Extract<Scene, { type: 'concept' }>; p: typeof PALETTES.cosmic; frames: number }> = ({ scene, p, frames }) => {
    const icon = useFadeUp(0)
    const title = useFadeUp(10)
    const body = useFadeUp(22)
    const highlight = useFadeUp(40)
    return (
        <FadeScene frames={frames}>
            <AbsoluteFill style={{ padding: '70px 120px', flexDirection: 'column', justifyContent: 'center', gap: 28 }}>
                <div style={{ ...icon, fontSize: 64 }}>{scene.icon}</div>
                <div style={{ ...title, fontSize: 54, fontWeight: 800, color: p.text, lineHeight: 1.2 }}>{scene.title}</div>
                <div style={{ ...body, fontSize: 32, color: p.sub, lineHeight: 1.75, maxWidth: 900 }}>{scene.body}</div>
                {scene.highlight && (
                    <div style={{
                        ...highlight,
                        display: 'inline-block', alignSelf: 'flex-start',
                        background: `${p.accent}18`, border: `1px solid ${p.accent}44`, borderLeft: `6px solid ${p.accent}`,
                        borderRadius: 12, padding: '14px 28px',
                        fontSize: 34, fontWeight: 700, color: p.accent,
                    }}>
                        {scene.highlight}
                    </div>
                )}
            </AbsoluteFill>
        </FadeScene>
    )
}

const FormulaScene: React.FC<{ scene: Extract<Scene, { type: 'formula' }>; p: typeof PALETTES.cosmic; frames: number }> = ({ scene, p, frames }) => {
    const frame = useCurrentFrame()
    const heading = useFadeUp(0)
    const formula = useFadeUp(15)
    const exp = useFadeUp(40)
    const glow = interpolate(frame, [15, 60, 100], [0, 1, 0.7], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.sin) })
    return (
        <FadeScene frames={frames}>
            <AbsoluteFill style={{ padding: '70px 120px', flexDirection: 'column', justifyContent: 'center', gap: 36 }}>
                <div style={{ ...heading, fontSize: 48, fontWeight: 800, color: p.text }}>{scene.icon ?? '📐'} {scene.title}</div>
                <div style={{
                    ...formula,
                    fontSize: 110, fontWeight: 900, color: p.danger,
                    textShadow: `0 0 ${40 + glow * 40}px ${p.danger}99`,
                    letterSpacing: 6, lineHeight: 1.2,
                }}>
                    {scene.formula}
                </div>
                {scene.explanation && (
                    <div style={{ ...exp, fontSize: 30, color: p.sub, maxWidth: 860, lineHeight: 1.7 }}>{scene.explanation}</div>
                )}
            </AbsoluteFill>
        </FadeScene>
    )
}

const ComparisonScene: React.FC<{ scene: Extract<Scene, { type: 'comparison' }>; p: typeof PALETTES.cosmic; frames: number }> = ({ scene, p, frames }) => {
    const heading = useFadeUp(0)
    const left = useFadeUp(15)
    const right = useFadeUp(30)
    const body = useFadeUp(50)
    return (
        <FadeScene frames={frames}>
            <AbsoluteFill style={{ padding: '70px 120px', flexDirection: 'column', justifyContent: 'center', gap: 36 }}>
                <div style={{ ...heading, fontSize: 48, fontWeight: 800, color: p.text }}>{scene.icon ?? '⚖️'} {scene.title}</div>
                <div style={{ display: 'flex', gap: 40, alignItems: 'stretch' }}>
                    <div style={{ ...left, flex: 1, background: `${p.secondary}15`, border: `2px solid ${p.secondary}44`, borderRadius: 20, padding: '28px 32px', fontSize: 30, color: p.secondary, fontWeight: 700, textAlign: 'center' }}>
                        {scene.leftLabel}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: 36, color: p.sub }}>VS</div>
                    <div style={{ ...right, flex: 1, background: `${p.warm}15`, border: `2px solid ${p.warm}44`, borderRadius: 20, padding: '28px 32px', fontSize: 30, color: p.warm, fontWeight: 700, textAlign: 'center' }}>
                        {scene.rightLabel}
                    </div>
                </div>
                {scene.body && <div style={{ ...body, fontSize: 28, color: p.sub, lineHeight: 1.7 }}>{scene.body}</div>}
            </AbsoluteFill>
        </FadeScene>
    )
}

const ConclusionScene: React.FC<{ scene: Extract<Scene, { type: 'conclusion' }>; p: typeof PALETTES.cosmic; frames: number }> = ({ scene, p, frames }) => {
    const frame = useCurrentFrame()
    const heading = useFadeUp(0)
    const COLORS = [p.warm, p.secondary, p.accent, p.danger, p.warm]
    return (
        <FadeScene frames={frames}>
            <AbsoluteFill style={{ padding: '60px 120px', flexDirection: 'column', justifyContent: 'center', gap: 32 }}>
                <div style={{ ...heading, fontSize: 52, fontWeight: 900, color: p.text }}>{scene.icon ?? '🏆'} {scene.title}</div>
                {scene.points.map((point, i) => {
                    const c = COLORS[i % COLORS.length]
                    const anim = {
                        opacity: interpolate(Math.max(0, frame - i * 18), [0, 20], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                        transform: `translateX(${interpolate(Math.max(0, frame - i * 18), [0, 20], [-24, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
                    }
                    return (
                        <div key={i} style={{ ...anim, display: 'flex', alignItems: 'center', gap: 24, background: `${c}10`, border: `1px solid ${c}30`, borderLeft: `6px solid ${c}`, borderRadius: 14, padding: '18px 28px' }}>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: c, flexShrink: 0 }} />
                            <span style={{ fontSize: 28, color: p.text, lineHeight: 1.5 }}>{point}</span>
                        </div>
                    )
                })}
            </AbsoluteFill>
        </FadeScene>
    )
}

const SubtitlesRenderer: React.FC<{ subtitles: NonNullable<AIVideoProps['subtitles']>; p: typeof PALETTES.cosmic }> = ({ subtitles, p }) => {
    const frame = useCurrentFrame()
    const { fps } = useVideoConfig()
    const currentTime = frame / fps

    const activeSubtitle = subtitles.find(s => currentTime >= s.start && currentTime <= s.end)

    if (!activeSubtitle) return null

    return (
        <AbsoluteFill style={{ justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 100, pointerEvents: 'none' }}>
            <div style={{
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(8px)',
                padding: '12px 32px',
                borderRadius: 20,
                border: `1px solid ${p.accent}44`,
                boxShadow: `0 8px 32px rgba(0,0,0,0.5)`,
            }}>
                <span style={{
                    fontSize: 42,
                    fontWeight: 700,
                    color: p.text,
                    textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                    letterSpacing: 2,
                }}>
                    {activeSubtitle.text}
                </span>
            </div>
        </AbsoluteFill>
    )
}

// ─── Main Composition ─────────────────────────────────────────────────────────

export const AIGeneratedVideo: React.FC<AIVideoProps> = ({ scenes, style = 'cosmic', audioUrl, subtitles }) => {
    const { fps } = useVideoConfig()
    const p = PALETTES[style]

    // 如果 audioUrl 是相对路径（来源于 localhost:3000/api/audio/...），拼接完整的 origin 进行读取
    const audioSrc = audioUrl ? (audioUrl.startsWith('/') ? `http://localhost:3000${audioUrl}` : audioUrl) : null

    return (
        <AbsoluteFill style={{ background: p.bg, fontFamily: '"Noto Sans SC","Inter","PingFang SC",sans-serif' }}>
            {/* 背景装饰 */}
            {style === 'cosmic' && <StarField />}
            {style === 'cosmic' && (
                <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 55%, ${p.accent}10 0%, transparent 65%)`, pointerEvents: 'none' }} />
            )}

            {/* 配音 */}
            {audioSrc && (
                <Audio src={audioSrc} volume={0.85} />
            )}

            {/* 场景串联 */}
            <Series>
                {scenes.map((scene, i) => {
                    const frames = Math.round(scene.durationSeconds * fps)
                    return (
                        <Series.Sequence key={i} durationInFrames={frames}>
                            {scene.type === 'title' && <TitleScene scene={scene} p={p} frames={frames} />}
                            {scene.type === 'concept' && <ConceptScene scene={scene} p={p} frames={frames} />}
                            {scene.type === 'formula' && <FormulaScene scene={scene} p={p} frames={frames} />}
                            {scene.type === 'comparison' && <ComparisonScene scene={scene} p={p} frames={frames} />}
                            {scene.type === 'conclusion' && <ConclusionScene scene={scene} p={p} frames={frames} />}
                        </Series.Sequence>
                    )
                })}
            </Series>

            {/* 进度条 */}
            <ProgressBar p={p} />

            {/* 渲染字幕 */}
            {subtitles && subtitles.length > 0 && <SubtitlesRenderer subtitles={subtitles} p={p} />}
        </AbsoluteFill>
    )
}
