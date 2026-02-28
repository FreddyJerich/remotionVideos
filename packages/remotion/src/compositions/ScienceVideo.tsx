import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
    Sequence,
    Easing,
} from 'remotion'
import { z } from 'zod'

export const scienceVideoSchema = z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    content: z.array(
        z.discriminatedUnion('type', [
            z.object({ type: z.literal('text'), text: z.string() }),
            z.object({ type: z.literal('highlight'), text: z.string(), color: z.string().optional() }),
        ])
    ),
    backgroundColor: z.string().default('#0a0a1a'),
    accentColor: z.string().default('#6366f1'),
    durationInFrames: z.number().default(300),
})

type ScienceVideoProps = z.infer<typeof scienceVideoSchema>

// 粒子背景
const ParticleBackground: React.FC<{ color: string }> = ({ color }) => {
    const frame = useCurrentFrame()
    const { width, height } = useVideoConfig()

    const particles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: ((i * 137.5 + frame * 0.3) % width),
        y: ((i * 97.3 + frame * 0.2) % height),
        size: (i % 3) + 1,
        opacity: 0.1 + (i % 5) * 0.05,
    }))

    return (
        <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            viewBox={`0 0 ${width} ${height}`}
        >
            {particles.map((p) => (
                <circle
                    key={p.id}
                    cx={p.x}
                    cy={p.y}
                    r={p.size}
                    fill={color}
                    opacity={p.opacity}
                />
            ))}
        </svg>
    )
}

// 标题动画
const AnimatedTitle: React.FC<{ title: string; subtitle?: string; accentColor: string }> = ({
    title,
    subtitle,
    accentColor,
}) => {
    const frame = useCurrentFrame()
    const { fps } = useVideoConfig()

    const titleProgress = spring({
        frame,
        fps,
        config: { damping: 15, stiffness: 80 },
    })

    const subtitleProgress = spring({
        frame: Math.max(0, frame - 15),
        fps,
        config: { damping: 15, stiffness: 80 },
    })

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                padding: '80px',
                textAlign: 'center',
            }}
        >
            <div
                style={{
                    fontSize: 96,
                    fontWeight: 900,
                    color: '#ffffff',
                    fontFamily: '"Noto Sans SC", sans-serif',
                    lineHeight: 1.2,
                    opacity: titleProgress,
                    transform: `translateY(${interpolate(titleProgress, [0, 1], [60, 0])}px)`,
                    textShadow: `0 0 60px ${accentColor}88`,
                }}
            >
                {title}
            </div>
            {subtitle && (
                <div
                    style={{
                        fontSize: 48,
                        color: accentColor,
                        fontFamily: '"Noto Sans SC", sans-serif',
                        marginTop: 32,
                        opacity: subtitleProgress,
                        transform: `translateY(${interpolate(subtitleProgress, [0, 1], [30, 0])}px)`,
                    }}
                >
                    {subtitle}
                </div>
            )}
        </div>
    )
}

// 内容卡片
const ContentSection: React.FC<{
    content: ScienceVideoProps['content']
    accentColor: string
}> = ({ content, accentColor }) => {
    const frame = useCurrentFrame()
    const { fps } = useVideoConfig()

    return (
        <div
            style={{
                padding: '60px 120px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 32,
            }}
        >
            {content.map((item, index) => {
                const itemProgress = spring({
                    frame: Math.max(0, frame - index * 20),
                    fps,
                    config: { damping: 15, stiffness: 100 },
                })

                return (
                    <div
                        key={index}
                        style={{
                            opacity: itemProgress,
                            transform: `translateX(${interpolate(itemProgress, [0, 1], [-40, 0])}px)`,
                            fontSize: item.type === 'highlight' ? 64 : 48,
                            color: item.type === 'highlight' ? (item.color ?? accentColor) : '#e8e8f0',
                            fontFamily: '"Noto Sans SC", sans-serif',
                            fontWeight: item.type === 'highlight' ? 700 : 400,
                            lineHeight: 1.6,
                            padding: item.type === 'highlight' ? '16px 32px' : '0',
                            borderLeft: item.type === 'highlight' ? `6px solid ${accentColor}` : 'none',
                            paddingLeft: item.type === 'highlight' ? '32px' : '0',
                        }}
                    >
                        {item.text}
                    </div>
                )
            })}
        </div>
    )
}

export const ScienceVideo: React.FC<ScienceVideoProps> = ({
    title,
    subtitle,
    content,
    backgroundColor,
    accentColor,
    durationInFrames,
}) => {
    const titleDuration = 90 // 3s 标题
    const fadeDuration = 15

    return (
        <AbsoluteFill
            style={{
                backgroundColor,
                fontFamily: '"Noto Sans SC", "Inter", sans-serif',
                overflow: 'hidden',
            }}
        >
            {/* 渐变叠加 */}
            <AbsoluteFill
                style={{
                    background: `radial-gradient(ellipse at 50% 50%, ${accentColor}15 0%, transparent 70%)`,
                }}
            />

            {/* 粒子背景 */}
            <ParticleBackground color={accentColor} />

            {/* 标题段 */}
            <Sequence durationInFrames={titleDuration}>
                <AnimatedTitle title={title} subtitle={subtitle} accentColor={accentColor} />
            </Sequence>

            {/* 内容段 */}
            <Sequence from={titleDuration} durationInFrames={durationInFrames - titleDuration}>
                <ContentSection content={content} accentColor={accentColor} />
            </Sequence>

            {/* 底部装饰线 */}
            <AbsoluteFill
                style={{
                    bottom: 0,
                    top: 'auto',
                    height: 4,
                    background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
                }}
            />
        </AbsoluteFill>
    )
}
