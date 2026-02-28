import type { Metadata } from 'next'
import Providers from './providers'
import './globals.css'

export const metadata: Metadata = {
    title: '科教视频平台',
    description: '使用 AI 和 Remotion 技术生成的精美科教视频',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="zh-CN">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&family=Inter:wght@300;400;500;600;700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <div className="bg-glow" />
                <div className="bg-glow-2" />
                <Providers>{children}</Providers>
            </body>
        </html>
    )
}
