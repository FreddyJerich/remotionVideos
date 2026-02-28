import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const SYSTEM_PROMPT = `你是一位顶级科教视频策划师，擅长将复杂科学概念转化为引人入胜的视频脚本。

请根据用户提供的视频标题，生成一个完整的科教视频脚本 JSON，格式如下：

{
  "totalSeconds": 60,
  "scenes": [
    {
      "type": "title",
      "durationSeconds": 6,
      "heading": "视频主标题",
      "sub": "副标题/年份/领域"
    },
    {
      "type": "concept",
      "durationSeconds": 9,
      "icon": "⚡",
      "title": "核心概念名称",
      "body": "用2-3句话简洁解释这个概念",
      "highlight": "关键词或短语"
    },
    {
      "type": "formula",
      "durationSeconds": 8,
      "icon": "📐",
      "title": "公式/定理名称",
      "formula": "数学表达式（支持上下标Unicode字符）",
      "explanation": "公式含义解释"
    },
    {
      "type": "comparison",
      "durationSeconds": 9,
      "icon": "⚖️",
      "title": "对比标题",
      "leftLabel": "左侧描述",
      "rightLabel": "右侧描述",
      "body": "对比说明"
    },
    {
      "type": "conclusion",
      "durationSeconds": 8,
      "icon": "🏆",
      "title": "总结标题",
      "points": ["要点1", "要点2", "要点3", "要点4"]
    }
  ],
  "voiceScript": "完整的配音文本，约150-200字，语调生动，适合科普讲解，与各场景内容对应。"
}

要求：
- totalSeconds 控制在 55-65 秒
- 场景数量 5-8 个，各 durationSeconds 之和等于 totalSeconds
- icon 使用单个 emoji
- formula 使用 Unicode 上下标字符（如 ² ³ ₁ ₂）
- voiceScript 流畅自然，有节奏感
- 只返回纯 JSON，不要任何 markdown 包裹`

export async function POST(req: NextRequest) {
  try {
    const client = new OpenAI({
      apiKey: process.env.QWEN_API_KEY || 'MISSING_KEY',
      baseURL: process.env.QWEN_BASE_URL ?? 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    })

    const { title, category = 'science', style = 'cosmic' } = await req.json()

    if (!title?.trim()) {
      return NextResponse.json({ error: '标题不能为空' }, { status: 400 })
    }

    const userPrompt = `请为以下科教视频生成脚本：
标题：${title}
分类：${category}
风格：${style === 'bright' ? '明亮活泼的课堂风格' : style === 'minimal' ? '极简干净的白板风格' : '深邃宇宙科技风格'}

生成 JSON 脚本：`

    const completion = await client.chat.completions.create({
      model: process.env.QWEN_MODEL ?? 'qwen-plus',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    })

    const raw = completion.choices[0]?.message?.content ?? ''

    // 从响应中提取 JSON（防止模型输出 markdown 包裹）
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('Qwen raw output:', raw)
      return NextResponse.json({ error: 'AI 返回格式错误，请重试' }, { status: 500 })
    }

    const script = JSON.parse(jsonMatch[0])

    // 基本校验
    if (!script.scenes || !Array.isArray(script.scenes)) {
      return NextResponse.json({ error: 'AI 生成脚本结构异常，请重试' }, { status: 500 })
    }

    return NextResponse.json({ script, title })
  } catch (err) {
    console.error('generate-script error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
