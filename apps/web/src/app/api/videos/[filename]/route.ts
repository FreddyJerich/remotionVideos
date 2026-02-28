import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        const { filename } = await params

        // 安全校验：只允许 .mp4 文件，不允许路径穿越
        if (!filename.endsWith('.mp4') || filename.includes('..') || filename.includes('/')) {
            return NextResponse.json({ error: 'Invalid filename' }, { status: 400 })
        }

        const videoPath = path.join(process.cwd(), 'public', 'videos', filename)

        try {
            await fs.access(videoPath)
        } catch {
            return new NextResponse(`Video not found: ${filename}`, { status: 404 })
        }

        const stat = await fs.stat(videoPath)
        const rangeHeader = req.headers.get('range')

        if (rangeHeader) {
            // 支持 range 请求，让浏览器可以拖动进度条
            const [startStr, endStr] = rangeHeader.replace('bytes=', '').split('-')
            const start = parseInt(startStr, 10)
            const end = endStr ? parseInt(endStr, 10) : stat.size - 1
            const chunkSize = end - start + 1

            const fileHandle = await fs.open(videoPath, 'r')
            const buffer = Buffer.alloc(chunkSize)
            await fileHandle.read(buffer, 0, chunkSize, start)
            await fileHandle.close()

            return new NextResponse(buffer, {
                status: 206,
                headers: {
                    'Content-Type': 'video/mp4',
                    'Content-Range': `bytes ${start}-${end}/${stat.size}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': String(chunkSize),
                    'Cache-Control': 'public, max-age=86400',
                },
            })
        }

        const buffer = await fs.readFile(videoPath)
        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'video/mp4',
                'Accept-Ranges': 'bytes',
                'Content-Length': String(stat.size),
                'Cache-Control': 'public, max-age=86400',
            },
        })
    } catch (e: any) {
        return NextResponse.json({ error: String(e) }, { status: 500 })
    }
}
