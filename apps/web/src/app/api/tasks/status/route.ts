import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        // 获取最近的渲染中/排队的任务和最新完成任务
        const tasks = await prisma.videoTask.findMany({
            where: {
                status: { in: ['QUEUED', 'RENDERING', 'COMPLETED', 'FAILED'] },
            },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: {
                id: true,
                title: true,
                status: true,
                videoUrl: true,
                errorMessage: true,
                createdAt: true,
                updatedAt: true,
            },
        })
        return NextResponse.json({ tasks })
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 })
    }
}
