import * as React from 'react'
import { Composition } from 'remotion'
import { ScienceVideo, scienceVideoSchema } from './compositions/ScienceVideo'
import { FormulaAnimation, formulaAnimationSchema } from './compositions/FormulaAnimation'
import { RelativityVideo, relativityVideoSchema } from './compositions/RelativityVideo'
import { AIGeneratedVideo, aiGeneratedVideoSchema, type AIVideoProps } from './compositions/AIGeneratedVideo'

const AI_DEFAULT_PROPS: AIVideoProps = {
    title: 'AI 科教视频',
    style: 'cosmic',
    totalSeconds: 60,
    scenes: [
        { type: 'title', durationSeconds: 6, heading: '科教视频标题', sub: '科学' },
        { type: 'concept', durationSeconds: 10, icon: '🔬', title: '核心概念', body: '这里展示核心概念的解释', highlight: '关键词' },
        { type: 'formula', durationSeconds: 9, icon: '📐', title: '核心公式', formula: 'F = ma', explanation: '公式的物理意义' },
        { type: 'conclusion', durationSeconds: 8, icon: '🏆', title: '总结', points: ['要点 1', '要点 2', '要点 3'] },
    ],
}

export const RemotionRoot: React.FC = () => {
    return (
        <>
            {/* AI 一键生成 - 通用模板 */}
            <Composition
                id="AIGeneratedVideo"
                component={AIGeneratedVideo}
                calculateMetadata={({ props }) => ({
                    durationInFrames: Math.round((props.totalSeconds ?? 60) * 30),
                    fps: 30,
                    width: 1920,
                    height: 1080,
                })}
                fps={30}
                width={1920}
                height={1080}
                durationInFrames={1800}
                schema={aiGeneratedVideoSchema}
                defaultProps={AI_DEFAULT_PROPS}
            />

            {/* 通用科教视频模板 */}
            <Composition
                id="ScienceVideo"
                component={ScienceVideo}
                durationInFrames={300}
                fps={30}
                width={1920}
                height={1080}
                schema={scienceVideoSchema}
                defaultProps={{
                    title: '科学视频标题',
                    subtitle: '副标题',
                    content: [{ type: 'text', text: '这里是视频内容...' }],
                    backgroundColor: '#0a0a1a',
                    accentColor: '#6366f1',
                    durationInFrames: 300,
                }}
            />

            {/* 公式动画模板 */}
            <Composition
                id="FormulaAnimation"
                component={FormulaAnimation}
                durationInFrames={180}
                fps={30}
                width={1920}
                height={1080}
                schema={formulaAnimationSchema}
                defaultProps={{
                    formula: 'E = mc²',
                    title: '质能方程',
                    explanation: '爱因斯坦的质能方程揭示了质量与能量的等价关系',
                    backgroundColor: '#0a0f1e',
                    durationInFrames: 180,
                }}
            />

            {/* 爱因斯坦相对论 60 秒科教视频 */}
            <Composition
                id="RelativityVideo"
                component={RelativityVideo}
                durationInFrames={1800}
                fps={30}
                width={1920}
                height={1080}
                schema={relativityVideoSchema}
                defaultProps={{ durationInFrames: 1800 }}
            />
        </>
    )
}
