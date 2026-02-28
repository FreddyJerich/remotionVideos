import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { execFile } from 'child_process'
import { promisify } from 'util'

const execFileAsync = promisify(execFile)

export async function POST(req: NextRequest) {
    try {
        const { text, taskId } = await req.json()

        if (!text?.trim() || !taskId) {
            return NextResponse.json({ error: '参数缺失' }, { status: 400 })
        }

        const audioDir = path.join(process.cwd(), 'public', 'audio')
        await fs.mkdir(audioDir, { recursive: true })
        const outputFile = path.join(audioDir, `${taskId}.mp3`)

        // 通过纯 Node worker 生成 TTS，并使用临时文件传递文本，彻底解决换行符导致的进程挂起问题
        const scriptPath = path.join(process.cwd(), 'scripts', 'tts-worker.js')
        const tmpTextFile = path.join(audioDir, `${taskId}.txt`)
        await fs.writeFile(tmpTextFile, text, 'utf-8')

        try {
            const { stdout, stderr } = await execFileAsync('node', [scriptPath, tmpTextFile, outputFile])
            if (!stdout.includes('SUCCESS')) {
                throw new Error(stderr || 'Unknown error from worker')
            }
        } finally {
            // 清理临时文件
            await fs.unlink(tmpTextFile).catch(() => { })
        }

        // 简单实用的等比时间戳算法生成字幕
        const stat = await fs.stat(outputFile)
        // 48kbps CBR mp3 = 6000 bytes/second
        const actualDurationSeconds = stat.size / 6000

        // 按照标点切分句子
        const chunks = text.split(/([。，！？\n])/g).filter(Boolean)
        const sentences: string[] = []
        for (let i = 0; i < chunks.length; i += 2) {
            const seg = (chunks[i] || '').trim()
            const punc = (chunks[i + 1] || '').trim()
            if (seg) sentences.push(seg + punc)
        }

        // 去掉纯真空句子
        const validSentences = sentences.filter(s => s.trim().length > 0)
        const totalChars = validSentences.reduce((acc, cur) => acc + cur.length, 0)

        const subtitles = []
        let currentStart = 0
        for (const s of validSentences) {
            // 按字符比例粗略分配时长（由于 TTS 连音发音和标点停顿会抵消，这样分配在短视频里足够用）
            const dur = (s.length / totalChars) * actualDurationSeconds
            subtitles.push({
                text: s,
                start: currentStart,
                end: currentStart + dur
            })
            currentStart += dur
        }

        const audioUrl = `/api/audio/${taskId}.mp3`
        return NextResponse.json({ audioUrl, subtitles })
    } catch (err) {
        console.error('generate-tts error:', err)
        return NextResponse.json({ error: String(err) }, { status: 500 })
    }
}
