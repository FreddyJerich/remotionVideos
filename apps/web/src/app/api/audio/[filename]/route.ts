import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(req: NextRequest, { params }: { params: Promise<{ filename: string }> }) {
    try {
        const { filename } = await params
        const audioPath = path.join(process.cwd(), 'public', 'audio', filename)

        try {
            await fs.access(audioPath)
        } catch (e) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 })
        }

        const buffer = await fs.readFile(audioPath)

        return new NextResponse(buffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Cache-Control': 'public, max-age=31536000',
                'Accept-Ranges': 'bytes',
            },
        })
    } catch (e: any) {
        return NextResponse.json({ error: String(e) }, { status: 500 })
    }
}
