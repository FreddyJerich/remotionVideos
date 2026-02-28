import {
    AbsoluteFill,
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion'
import { z } from 'zod'

export const formulaAnimationSchema = z.object({
    formula: z.string(),
    title: z.string(),
    explanation: z.string().optional(),
    backgroundColor: z.string().default('#0a0f1e'),
    durationInFrames: z.number().default(180),
})

type FormulaAnimationProps = z.infer<typeof formulaAnimationSchema>

export const FormulaAnimation: React.FC<FormulaAnimationProps> = ({
    formula,
    title,
    explanation,
    backgroundColor,
    durationInFrames,
}) => {
    const frame = useCurrentFrame()
    const { fps } = useVideoConfig()

    const titleProgress = spring({ frame, fps, config: { damping: 14 } })
    const formulaProgress = spring({
        frame: Math.max(0, frame - 20),
        fps,
        config: { damping: 12, stiffness: 60 },
    })
    const explProgress = spring({
        frame: Math.max(0, frame - 50),
        fps,
        config: { damping: 15 },
    })

    // 公式发光脉冲
    const glowIntensity = interpolate(
        Math.sin((frame / fps) * Math.PI),
        [-1, 1],
        [40, 80]
    )

    return (
        <AbsoluteFill
            style={{
                backgroundColor,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 60,
                overflow: 'hidden',
            }}
        >
            {/* 网格背景 */}
            <svg
                style={{ position: 'absolute', inset: 0, opacity: 0.05 }}
                width="100%"
                height="100%"
            >
                <defs>
                    <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                        <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#4f46e5" strokeWidth="1" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* 标题 */}
            <div
                style={{
                    fontSize: 52,
                    fontWeight: 700,
                    color: '#a5b4fc',
                    fontFamily: '"Noto Sans SC", sans-serif',
                    opacity: titleProgress,
                    transform: `translateY(${interpolate(titleProgress, [0, 1], [-30, 0])}px)`,
                    letterSpacing: 4,
                }}
            >
                {title}
            </div>

            {/* 公式卡片 */}
            <div
                style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '2px solid rgba(99, 102, 241, 0.4)',
                    borderRadius: 24,
                    padding: '60px 120px',
                    opacity: formulaProgress,
                    transform: `scale(${interpolate(formulaProgress, [0, 1], [0.8, 1])})`,
                    boxShadow: `0 0 ${glowIntensity}px rgba(99, 102, 241, 0.4), inset 0 0 40px rgba(99, 102, 241, 0.05)`,
                }}
            >
                <div
                    style={{
                        fontSize: 128,
                        fontWeight: 900,
                        color: '#ffffff',
                        fontFamily: '"STIX Two Text", "Times New Roman", serif',
                        textShadow: `0 0 ${glowIntensity}px #6366f1`,
                        lineHeight: 1,
                    }}
                >
                    {formula}
                </div>
            </div>

            {/* 说明文字 */}
            {explanation && (
                <div
                    style={{
                        fontSize: 42,
                        color: '#94a3b8',
                        fontFamily: '"Noto Sans SC", sans-serif',
                        maxWidth: 1400,
                        textAlign: 'center',
                        lineHeight: 1.6,
                        opacity: explProgress,
                        transform: `translateY(${interpolate(explProgress, [0, 1], [20, 0])}px)`,
                        padding: '0 80px',
                    }}
                >
                    {explanation}
                </div>
            )}
        </AbsoluteFill>
    )
}
