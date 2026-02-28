import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page') ?? '1')
    const limit = Number(searchParams.get('limit') ?? '12')
    const category = searchParams.get('category')
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}
    if (category) where.category = category
    if (status) where.status = status
    else where.status = 'COMPLETED' // 前台只显示已完成的

    const [tasks, total] = await Promise.all([
        prisma.videoTask.findMany({
            where,
            orderBy: { publishedAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
            select: {
                id: true,
                title: true,
                description: true,
                category: true,
                tags: true,
                thumbnailUrl: true,
                videoUrl: true,
                duration: true,
                viewCount: true,
                publishedAt: true,
            },
        }),
        prisma.videoTask.count({ where }),
    ])

    return NextResponse.json({
        tasks,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    })
}
