import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/prisma'

/**
 * GitHub Actions 渲染完成后回调此接口
 * 更新任务状态和视频 URL
 */
export async function POST(req: NextRequest) {
    // 验证 Webhook Secret
    const authHeader = req.headers.get('Authorization')
    const expectedToken = `Bearer ${process.env.WEBHOOK_SECRET}`

    if (!authHeader) {
        return NextResponse.json({ error: 'Missing Authorization' }, { status: 401 })
    }

    // timing-safe 比较防止时序攻击
    try {
        const providedBuffer = Buffer.from(authHeader)
        const expectedBuffer = Buffer.from(expectedToken)
        if (
            providedBuffer.length !== expectedBuffer.length ||
            !timingSafeEqual(providedBuffer, expectedBuffer)
        ) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        }
    } catch {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { task_id, status, video_url, thumbnail_url, duration, github_run_id, github_run_url, error_message } = body

        if (!task_id || !status) {
            return NextResponse.json({ error: '缺少 task_id 或 status' }, { status: 400 })
        }

        // 映射状态
        const statusMap: Record<string, string> = {
            rendering: 'RENDERING',
            uploading: 'UPLOADING',
            completed: 'COMPLETED',
            failed: 'FAILED',
        }

        const prismaStatus = statusMap[status.toLowerCase()]
        if (!prismaStatus) {
            return NextResponse.json({ error: `未知状态: ${status}` }, { status: 400 })
        }

        const updateData: Record<string, unknown> = {
            status: prismaStatus,
        }

        if (video_url) updateData.videoUrl = video_url
        if (thumbnail_url) updateData.thumbnailUrl = thumbnail_url
        if (duration != null) updateData.duration = Number(duration)
        if (github_run_id) updateData.githubRunId = String(github_run_id)
        if (github_run_url) updateData.githubRunUrl = github_run_url
        if (error_message) updateData.errorMessage = error_message
        if (prismaStatus === 'COMPLETED') updateData.publishedAt = new Date()

        const task = await prisma.videoTask.update({
            where: { id: task_id },
            data: updateData,
        })

        console.log(`[webhook] Task ${task_id} → ${prismaStatus}`, video_url ? `URL: ${video_url}` : '')
        return NextResponse.json({ success: true, task })
    } catch (error) {
        console.error('[webhook] Error:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
