import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { execFile } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'

const REMOTION_DIR = path.resolve(process.cwd(), '..', '..', 'packages', 'remotion')
const MONOREPO_ROOT = path.resolve(process.cwd(), '..', '..')
const OUTPUT_DIR = path.resolve(process.cwd(), 'public', 'videos')

// 在后台异步执行渲染，不等待完成
async function runLocalRender(taskId: string, composition: string, props: Record<string, unknown>, outputFile: string) {
    await fs.mkdir(OUTPUT_DIR, { recursive: true })

    // 写 props 到临时文件避免命令行长度和特殊字符问题
    const propsFile = path.join(OUTPUT_DIR, `${taskId}.props.json`)
    await fs.writeFile(propsFile, JSON.stringify(props), 'utf-8')

    return new Promise<void>((resolve) => {
        // 使用 Remotion Node API worker，避开 CLI 的 Node v24 兼容性问题
        const workerScript = path.join(REMOTION_DIR, 'render-worker.js')

        const child = execFile(
            process.execPath,
            [workerScript, propsFile, outputFile, composition],
            {
                cwd: REMOTION_DIR,
                env: {
                    ...process.env,
                    REMOTION_CHROMIUM_EXECUTABLE_PATH: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
                },
                maxBuffer: 100 * 1024 * 1024,
                timeout: 15 * 60 * 1000, // 15 分钟超时
            },
            async (error, stdout, stderr) => {
                // 清理 props 临时文件
                await fs.unlink(propsFile).catch(() => { })

                if (error) {
                    console.error(`[render] Task ${taskId} FAILED:`, stderr || error.message)
                    await prisma.videoTask.update({
                        where: { id: taskId },
                        data: {
                            status: 'FAILED',
                            errorMessage: stderr?.slice(-2000) || error.message,
                        },
                    }).catch(console.error)
                } else {
                    console.log(`[render] Task ${taskId} COMPLETED`)
                    const videoUrl = `/api/videos/${taskId}.mp4`
                    await prisma.videoTask.update({
                        where: { id: taskId },
                        data: {
                            status: 'COMPLETED',
                            videoUrl,
                        },
                    }).catch(console.error)
                }
                resolve()
            }
        )

        child.stdout?.on('data', (d) => process.stdout.write(`[render ${taskId}] ${d}`))
        child.stderr?.on('data', (d) => process.stderr.write(`[render ${taskId}] ${d}`))
    })
}

export async function POST(req: NextRequest) {
    // 验证登录
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { title, description, composition, props, category, tags } = body

        if (!title || !composition || !props) {
            return NextResponse.json({ error: '缺少必填字段: title, composition, props' }, { status: 400 })
        }

        // 创建任务记录
        const task = await prisma.videoTask.create({
            data: {
                title,
                description,
                composition,
                props,
                category,
                tags,
                status: 'QUEUED',
            },
        })

        const outputFile = path.join(OUTPUT_DIR, `${task.id}.mp4`)

        // 异步在后台渲染，不阻塞 HTTP 响应
        runLocalRender(task.id, composition, props, outputFile).catch(console.error)

        return NextResponse.json({
            success: true,
            task: { ...task, status: 'QUEUED' },
            message: '渲染任务已在本地后台启动！请在任务列表中查看进度',
        })
    } catch (error) {
        console.error('[trigger-render] Error:', error)
        return NextResponse.json(
            { error: '触发渲染失败', detail: String(error) },
            { status: 500 }
        )
    }
}
