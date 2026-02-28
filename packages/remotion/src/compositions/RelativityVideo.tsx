import * as React from 'react'
import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
    Sequence,
    Series,
    Easing,
} from 'remotion'
import { z } from 'zod'

export const relativityVideoSchema = z.object({
    durationInFrames: z.number().default(1800),
})

type Props = z.infer<typeof relativityVideoSchema>

// ─── 颜色 ───────────────────────────────────────────────────────────────────

const BG = '#050814'
const ACCENT = '#a78bfa'
const GOLD = '#fbbf24'
const BLUE = '#60a5fa'
const RED = '#f87171'

// ─── 公共组件 ────────────────────────────────────────────────────────────────

const StarField: React.FC = () => {
    const frame = useCurrentFrame()
    const { width, height } = useVideoConfig()
    const stars = Array.from({ length: 80 }, (_, i) => ({
        x: (i * 193.7 + 37) % width,
        y: (i * 79.3 + 91) % height,
        r: 1 + (i % 3),
        op: 0.2 + (Math.sin(frame * 0.02 + i) * 0.5 + 0.5) * 0.6,
    }))
    return (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            {stars.map((s, i) => (
                <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.op} />
            ))}
        </svg>
    )
}

const Background: React.FC = () => (
    <AbsoluteFill style={{ background: BG }}>
        <StarField />
        <AbsoluteFill style={{
            background: `radial-gradient(ellipse at 50% 60%, ${ACCENT}12 0%, transparent 60%)`
        }} />
    </AbsoluteFill>
)

const ProgressBar: React.FC = () => {
    const frame = useCurrentFrame()
    const { durationInFrames } = useVideoConfig()
    const progress = frame / durationInFrames
    return (
        <AbsoluteFill style={{ top: 'auto', bottom: 0, height: 4 }}>
            <div style={{
                height: '100%',
                width: `${progress * 100}%`,
                background: `linear-gradient(90deg, ${ACCENT}, ${BLUE})`,
                boxShadow: `0 0 16px ${ACCENT}`,
            }} />
        </AbsoluteFill>
    )
}

function useFadeUp(delay = 0) {
    const frame = useCurrentFrame()
    const { fps } = useVideoConfig()
    const f = Math.max(0, frame - delay)
    const sp = spring({ frame: f, fps, config: { damping: 30, stiffness: 120 } })
    return {
        opacity: sp,
        transform: `translateY(${interpolate(sp, [0, 1], [40, 0])}px)`,
    }
}

// ─── 幕间淡入淡出包装器 ──────────────────────────────────────────────────────

const FadeScene: React.FC<{ children: React.ReactNode; totalFrames: number }> = ({ children, totalFrames }) => {
    const frame = useCurrentFrame()
    const FADE = 18
    const fadeIn = interpolate(frame, [0, FADE], [0, 1], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    })
    const fadeOut = interpolate(frame, [totalFrames - FADE, totalFrames], [1, 0], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    })
    const opacity = Math.min(fadeIn, fadeOut)
    return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>
}

// ─── Scene 1: 封面（6s = 180f）──────────────────────────────────────────────

const SceneTitle: React.FC<{ totalFrames: number }> = ({ totalFrames }) => {
    const frame = useCurrentFrame()
    const { fps } = useVideoConfig()

    const badge = useFadeUp(5)
    const title1 = useFadeUp(15)
    const title2 = useFadeUp(28)

    const pulse = interpolate(frame, [0, 60, 120], [0.4, 1, 0.4], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        easing: Easing.inOut(Easing.sin),
    })

    return (
        <FadeScene totalFrames={totalFrames}>
            <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24 }}>
                <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', border: `2px solid ${ACCENT}`, opacity: pulse * 0.15, transform: `scale(${1 + pulse * 0.1})` }} />
                <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', border: `1px solid ${ACCENT}`, opacity: pulse * 0.2 }} />

                <div style={{ ...badge, fontSize: 22, color: ACCENT, fontWeight: 600, letterSpacing: 4 }}>
                    阿尔伯特 · 爱因斯坦  1905
                </div>
                <div style={{ ...title1, fontSize: 108, fontWeight: 900, color: '#fff', lineHeight: 1.1, textAlign: 'center', textShadow: `0 0 80px ${ACCENT}` }}>
                    相对论
                </div>
                <div style={{ ...title2, fontSize: 36, color: '#a1a1aa', letterSpacing: 2, textAlign: 'center' }}>
                    Theory of Relativity
                </div>
            </AbsoluteFill>
        </FadeScene>
    )
}

// ─── Scene 2: 光速不变（8s = 240f）──────────────────────────────────────────

const SceneLightSpeed: React.FC<{ totalFrames: number }> = ({ totalFrames }) => {
    const frame = useCurrentFrame()
    const { width, height } = useVideoConfig()

    const heading = useFadeUp(0)
    const line1 = useFadeUp(15)
    const line2 = useFadeUp(30)
    const formula = useFadeUp(50)

    const lightX = interpolate(frame, [0, 120], [-300, width + 300], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    })

    return (
        <FadeScene totalFrames={totalFrames}>
            <AbsoluteFill style={{ padding: '80px 120px', flexDirection: 'column', justifyContent: 'center', gap: 40 }}>
                <div style={{ position: 'absolute', top: height * 0.42, left: 0, width: 320, height: 2, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`, transform: `translateX(${lightX}px)`, boxShadow: `0 0 30px ${GOLD}` }} />

                <div style={{ ...heading, fontSize: 56, fontWeight: 800, color: '#fff' }}>⚡ 光速不变原理</div>
                <div style={{ ...line1, fontSize: 32, color: '#d4d4d8', lineHeight: 1.7 }}>无论光源或观测者如何运动，</div>
                <div style={{ ...line2, fontSize: 32, color: '#d4d4d8', lineHeight: 1.7 }}>在真空中，光的速度始终恒定：</div>
                <div style={{ ...formula, background: `rgba(167,139,250,0.12)`, border: `1px solid ${ACCENT}55`, borderLeft: `6px solid ${ACCENT}`, borderRadius: 16, padding: '32px 48px', fontSize: 72, fontWeight: 900, color: ACCENT, letterSpacing: 4, textShadow: `0 0 40px ${ACCENT}`, alignSelf: 'flex-start' }}>
                    c ≈ 3 × 10⁸ m/s
                </div>
            </AbsoluteFill>
        </FadeScene>
    )
}

// ─── Scene 3: 时间膨胀（9s = 270f）──────────────────────────────────────────

const SceneTimeDilation: React.FC<{ totalFrames: number }> = ({ totalFrames }) => {
    const frame = useCurrentFrame()
    const { fps } = useVideoConfig()

    const heading = useFadeUp(0)
    const clocks = useFadeUp(20)
    const formula = useFadeUp(70)
    const note = useFadeUp(100)

    const slowTick = interpolate(frame, [0, 270], [0, 60], { extrapolateRight: 'clamp' })
    const fastTick = interpolate(frame, [0, 270], [0, 180], { extrapolateRight: 'clamp' })

    function ClockFace({ tick, label, color }: { tick: number; label: string; color: string }) {
        const angle = (tick / 60) * 360
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <svg width="160" height="160" viewBox="0 0 160 160">
                    <circle cx="80" cy="80" r="70" fill="none" stroke={color} strokeWidth="3" opacity="0.5" />
                    <line x1="80" y1="80" x2={80 + 55 * Math.sin(angle * Math.PI / 180)} y2={80 - 55 * Math.cos(angle * Math.PI / 180)} stroke={color} strokeWidth="3" strokeLinecap="round" />
                    <circle cx="80" cy="80" r="5" fill={color} />
                </svg>
                <div style={{ fontSize: 22, color, fontWeight: 600 }}>{label}</div>
            </div>
        )
    }

    return (
        <FadeScene totalFrames={totalFrames}>
            <AbsoluteFill style={{ padding: '60px 120px', flexDirection: 'column', justifyContent: 'center', gap: 36 }}>
                <div style={{ ...heading, fontSize: 56, fontWeight: 800, color: '#fff' }}>⏱ 时间膨胀</div>
                <div style={{ ...clocks, display: 'flex', gap: 80, alignItems: 'center' }}>
                    <ClockFace tick={fastTick} label="静止时钟" color={BLUE} />
                    <div style={{ fontSize: 40, color: '#71717a' }}>vs</div>
                    <ClockFace tick={slowTick} label="高速飞驰的时钟" color={RED} />
                    <div style={{ fontSize: 28, color: '#d4d4d8', maxWidth: 280, lineHeight: 1.6 }}>
                        高速运动的物体，时间走得<span style={{ color: RED, fontWeight: 700 }}>更慢</span>
                    </div>
                </div>
                <div style={{ ...formula, background: 'rgba(96,165,250,0.1)', border: `1px solid ${BLUE}44`, borderLeft: `6px solid ${BLUE}`, borderRadius: 16, padding: '24px 40px', fontSize: 52, fontWeight: 800, color: BLUE, alignSelf: 'flex-start' }}>
                    t' = t / √(1 - v²/c²)
                </div>
                <div style={{ ...note, fontSize: 28, color: '#71717a' }}>γ 因子（洛伦兹因子）：速度越接近光速，时间越慢</div>
            </AbsoluteFill>
        </FadeScene>
    )
}

// ─── Scene 4: 长度收缩（7s = 210f）──────────────────────────────────────────

const SceneLengthContraction: React.FC<{ totalFrames: number }> = ({ totalFrames }) => {
    const frame = useCurrentFrame()

    const heading = useFadeUp(0)
    const rodAnim = useFadeUp(20)
    const formula = useFadeUp(60)
    const note = useFadeUp(90)

    const contractRatio = interpolate(frame, [60, 160], [1, 0.42], {
        easing: Easing.inOut(Easing.quad),
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    })

    return (
        <FadeScene totalFrames={totalFrames}>
            <AbsoluteFill style={{ padding: '60px 120px', flexDirection: 'column', justifyContent: 'center', gap: 40 }}>
                <div style={{ ...heading, fontSize: 56, fontWeight: 800, color: '#fff' }}>📏 长度收缩</div>
                <div style={{ ...rodAnim }}>
                    <div style={{ fontSize: 26, color: '#a1a1aa', marginBottom: 20 }}>
                        高速运动方向上的物体会显得更<span style={{ color: GOLD, fontWeight: 700 }}>短</span>：
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                        <div style={{ fontSize: 22, color: BLUE, width: 100 }}>静止</div>
                        <div style={{ width: 600, height: 28, background: BLUE, borderRadius: 4, boxShadow: `0 0 20px ${BLUE}55` }} />
                        <div style={{ fontSize: 22, color: BLUE }}>L₀</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{ fontSize: 22, color: GOLD, width: 100 }}>高速</div>
                        <div style={{ width: 600 * contractRatio, height: 28, background: GOLD, borderRadius: 4, boxShadow: `0 0 20px ${GOLD}55` }} />
                        <div style={{ fontSize: 22, color: GOLD }}>{contractRatio.toFixed(2)}L₀</div>
                    </div>
                </div>
                <div style={{ ...formula, background: 'rgba(251,191,36,0.1)', border: `1px solid ${GOLD}44`, borderLeft: `6px solid ${GOLD}`, borderRadius: 16, padding: '24px 40px', fontSize: 52, fontWeight: 800, color: GOLD, alignSelf: 'flex-start' }}>
                    L = L₀ · √(1 - v²/c²)
                </div>
                <div style={{ ...note, fontSize: 28, color: '#71717a' }}>速度越快，在运动方向上看起来越短</div>
            </AbsoluteFill>
        </FadeScene>
    )
}

// ─── Scene 5: E=mc² （11s = 330f）────────────────────────────────────────────

const SceneEMC2: React.FC<{ totalFrames: number }> = ({ totalFrames }) => {
    const frame = useCurrentFrame()

    const heading = useFadeUp(0)
    const formula = useFadeUp(20)
    const exp1 = useFadeUp(60)
    const exp2 = useFadeUp(80)
    const exp3 = useFadeUp(100)

    const glow = interpolate(frame, [20, 80, 140], [0, 1, 0.7], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        easing: Easing.inOut(Easing.sin),
    })

    const rings = [0, 30, 60, 90].map(d => ({
        scale: interpolate(Math.max(0, frame - d), [0, 120], [0.2, 2.5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
        opacity: interpolate(Math.max(0, frame - d), [0, 120], [0.5, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    }))

    return (
        <FadeScene totalFrames={totalFrames}>
            <AbsoluteFill style={{ padding: '60px 120px', flexDirection: 'column', justifyContent: 'center', gap: 40 }}>
                <div style={{ position: 'absolute', right: 200, top: '50%', transform: 'translateY(-50%)' }}>
                    {rings.map((ring, i) => (
                        <div key={i} style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', border: `2px solid ${RED}`, transform: `translate(-50%, -50%) scale(${ring.scale})`, opacity: ring.opacity }} />
                    ))}
                    <div style={{ fontSize: 120, opacity: interpolate(frame, [20, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }}>💥</div>
                </div>

                <div style={{ ...heading, fontSize: 56, fontWeight: 800, color: '#fff' }}>⚛️ 质能方程</div>
                <div style={{ ...formula, fontSize: 128, fontWeight: 900, color: RED, textShadow: `0 0 ${60 + glow * 40}px ${RED}`, letterSpacing: 8 }}>
                    E = mc²
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {([
                        { s: exp1, icon: '🔵', txt: 'E = 能量（Joules）', c: BLUE },
                        { s: exp2, icon: '🟡', txt: 'm = 质量（kg）', c: GOLD },
                        { s: exp3, icon: '⚡', txt: 'c² = 光速的平方（≈9×10¹⁶ m²/s²）', c: ACCENT },
                    ] as const).map(({ s, icon, txt, c }, i) => (
                        <div key={i} style={{ ...s, display: 'flex', alignItems: 'center', gap: 20, fontSize: 32, color: c }}>
                            <span style={{ fontSize: 36 }}>{icon}</span>
                            <span>{txt}</span>
                        </div>
                    ))}
                </div>
            </AbsoluteFill>
        </FadeScene>
    )
}

// ─── Scene 6: 时空弯曲（9s = 270f）──────────────────────────────────────────

const SceneSpacetime: React.FC<{ totalFrames: number }> = ({ totalFrames }) => {
    const frame = useCurrentFrame()

    const heading = useFadeUp(0)
    const desc = useFadeUp(20)
    const mesh = useFadeUp(30)
    const note = useFadeUp(90)

    const bendAmount = interpolate(frame, [30, 150], [0, 60], {
        easing: Easing.inOut(Easing.quad),
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    })

    const cols = 8, rows = 6
    const gW = 640, gH = 420
    const cx = gW / 2, cy = gH / 2
    const gridLines: React.ReactNode[] = []

    for (let r2 = 0; r2 <= rows; r2++) {
        const y0 = (r2 / rows) * gH
        let d = ''
        for (let c2 = 0; c2 <= cols; c2++) {
            const x = (c2 / cols) * gW
            const dx = x - cx, dy = y0 - cy
            const dist = Math.sqrt(dx * dx + dy * dy)
            const maxDist = Math.sqrt(cx * cx + cy * cy)
            const b = bendAmount * Math.exp(-Math.pow(dist / (maxDist * 0.6), 1.5))
            const wx = x + (dx / Math.max(dist, 1)) * b * 0.3
            const wy = y0 + (dy / Math.max(dist, 1)) * b
            d += c2 === 0 ? `M ${wx} ${wy}` : ` L ${wx} ${wy}`
        }
        gridLines.push(<path key={`r${r2}`} d={d} stroke={`${ACCENT}88`} strokeWidth="1.5" fill="none" />)
    }
    for (let c2 = 0; c2 <= cols; c2++) {
        const x0 = (c2 / cols) * gW
        let d = ''
        for (let r2 = 0; r2 <= rows; r2++) {
            const y = (r2 / rows) * gH
            const dx = x0 - cx, dy = y - cy
            const dist = Math.sqrt(dx * dx + dy * dy)
            const maxDist = Math.sqrt(cx * cx + cy * cy)
            const b = bendAmount * Math.exp(-Math.pow(dist / (maxDist * 0.6), 1.5))
            const wx = x0 + (dx / Math.max(dist, 1)) * b * 0.3
            const wy = y + (dy / Math.max(dist, 1)) * b
            d += r2 === 0 ? `M ${wx} ${wy}` : ` L ${wx} ${wy}`
        }
        gridLines.push(<path key={`c${c2}`} d={d} stroke={`${ACCENT}88`} strokeWidth="1.5" fill="none" />)
    }

    return (
        <FadeScene totalFrames={totalFrames}>
            <AbsoluteFill style={{ padding: '60px 120px', flexDirection: 'column', justifyContent: 'center', gap: 40 }}>
                <div style={{ ...heading, fontSize: 56, fontWeight: 800, color: '#fff' }}>🌌 时空弯曲</div>
                <div style={{ ...desc, fontSize: 30, color: '#d4d4d8' }}>质量使时空弯曲，引力即为弯曲的时空</div>
                <div style={{ ...mesh }}>
                    <svg width={gW} height={gH} viewBox={`0 0 ${gW} ${gH}`}>
                        {gridLines}
                        <circle cx={cx} cy={cy} r={40} fill={GOLD} opacity={0.9} />
                        <circle cx={cx} cy={cy} r={60} fill="none" stroke={GOLD} strokeWidth="2" opacity={interpolate(frame, [0, 60], [0, 0.4], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })} />
                    </svg>
                </div>
                <div style={{ ...note, fontSize: 26, color: '#71717a' }}>这是广义相对论的核心：质量 → 时空弯曲 → 引力效应</div>
            </AbsoluteFill>
        </FadeScene>
    )
}

// ─── Scene 7: 总结（15s= 450f）──────────────────────────────────────────────

const SceneConclusion: React.FC<{ totalFrames: number }> = ({ totalFrames }) => {
    const frame = useCurrentFrame()

    const heading = useFadeUp(0)

    const points = [
        { icon: '⚡', text: '光速不变：真空中光速恒为 c ≈ 3×10⁸ m/s', delay: 10, color: GOLD },
        { icon: '⏱', text: '时间膨胀：高速运动使时间走得更慢', delay: 30, color: BLUE },
        { icon: '📏', text: '长度收缩：高速运动方向上物体会缩短', delay: 50, color: ACCENT },
        { icon: '⚛️', text: 'E = mc²：质量与能量可以相互转化', delay: 70, color: RED },
        { icon: '🌌', text: '时空弯曲：质量弯曲时空，引力由此而来', delay: 90, color: GOLD },
    ]

    return (
        <FadeScene totalFrames={totalFrames}>
            <AbsoluteFill style={{ padding: '60px 120px', flexDirection: 'column', justifyContent: 'center', gap: 40 }}>
                <div style={{ ...heading, fontSize: 64, fontWeight: 900, color: '#fff' }}>🏆 相对论的五大支柱</div>
                {points.map(({ icon, text, delay, color }, i) => {
                    const a = {
                        opacity: interpolate(Math.max(0, frame - delay), [0, 25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                        transform: `translateX(${interpolate(Math.max(0, frame - delay), [0, 25], [-30, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
                    }
                    return (
                        <div key={i} style={{ ...a, display: 'flex', alignItems: 'center', gap: 28, background: `${color}0f`, border: `1px solid ${color}33`, borderLeft: `6px solid ${color}`, borderRadius: 16, padding: '20px 32px' }}>
                            <span style={{ fontSize: 40 }}>{icon}</span>
                            <span style={{ fontSize: 30, color: '#e8e8f0', lineHeight: 1.5 }}>{text}</span>
                        </div>
                    )
                })}
            </AbsoluteFill>
        </FadeScene>
    )
}

// ─── 主合成（总 1800 帧 = 60s @ 30fps）──────────────────────────────────────

export const RelativityVideo: React.FC<Props> = () => {
    const S1 = 180  // 标题 6s
    const S2 = 240  // 光速 8s
    const S3 = 270  // 时间膨胀 9s
    const S4 = 210  // 长度收缩 7s
    const S5 = 330  // 质能方程 11s
    const S6 = 270  // 时空弯曲 9s
    const S7 = 300  // 总结 10s
    // 合计 = 1800 帧

    return (
        <AbsoluteFill style={{ background: BG, fontFamily: '"Noto Sans SC","Inter",sans-serif' }}>
            <Background />
            <Series>
                <Series.Sequence durationInFrames={S1}>
                    <SceneTitle totalFrames={S1} />
                </Series.Sequence>
                <Series.Sequence durationInFrames={S2}>
                    <SceneLightSpeed totalFrames={S2} />
                </Series.Sequence>
                <Series.Sequence durationInFrames={S3}>
                    <SceneTimeDilation totalFrames={S3} />
                </Series.Sequence>
                <Series.Sequence durationInFrames={S4}>
                    <SceneLengthContraction totalFrames={S4} />
                </Series.Sequence>
                <Series.Sequence durationInFrames={S5}>
                    <SceneEMC2 totalFrames={S5} />
                </Series.Sequence>
                <Series.Sequence durationInFrames={S6}>
                    <SceneSpacetime totalFrames={S6} />
                </Series.Sequence>
                <Series.Sequence durationInFrames={S7}>
                    <SceneConclusion totalFrames={S7} />
                </Series.Sequence>
            </Series>
            <ProgressBar />
        </AbsoluteFill>
    )
}
