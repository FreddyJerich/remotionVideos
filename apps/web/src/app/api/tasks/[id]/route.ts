import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { promises as fs } from 'fs'
import path from 'path'

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    // 验证登录
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id } = await params
        if (!id) {
            return NextResponse.json({ error: 'Missing task ID' }, { status: 400 })
        }

        // 获取任务记录以便后续清理附件
        const task = await prisma.videoTask.findUnique({
            where: { id }
        })

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 })
        }

        // 从数据库删除任务记录
        await prisma.videoTask.delete({
            where: { id }
        })

        // 尝试删除本地的关联文件（视频、音频、中间 JSON 属性文件）
        const outputDir = path.resolve(process.cwd(), 'public', 'videos')
        const audioDir = path.resolve(process.cwd(), 'public', 'audio')

        try {
            await fs.unlink(path.join(outputDir, `${id}.mp4`)).catch(() => { })
            await fs.unlink(path.join(outputDir, `${id}.props.json`)).catch(() => { })
            await fs.unlink(path.join(audioDir, `task-${id}.mp4`)).catch(() => { })
            await fs.unlink(path.join(audioDir, `task-${id}.mp3`)).catch(() => { })
            await fs.unlink(path.join(audioDir, `task-${id}.txt`)).catch(() => { })
            await fs.unlink(path.join(audioDir, `${id}.mp3`)).catch(() => { })
        } catch (fileErr) {
            console.error('[Delete Task] Failed to cleanup files for:', id, fileErr)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('[Delete Task] Error:', error)
        return NextResponse.json(
            { error: 'Failed to delete task', detail: String(error) },
            { status: 500 }
        )
    }
}
