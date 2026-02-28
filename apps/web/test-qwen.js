const OpenAI = require('openai');
require('dotenv').config();

console.log('API KEY from env:', process.env.QWEN_API_KEY ? 'Present' : 'Missing');

const client = new OpenAI({
    apiKey: process.env.QWEN_API_KEY,
    baseURL: process.env.QWEN_BASE_URL ?? 'https://dashscope.aliyuncs.com/compatible-mode/v1',
});

async function main() {
    try {
        console.log('Requesting QWEN...');
        const completion = await client.chat.completions.create({
            model: process.env.QWEN_MODEL ?? 'qwen-plus',
            messages: [{ role: 'user', content: 'hello' }],
        });
        console.log('QWEN response:', completion.choices[0].message.content);
    } catch (e) {
        console.error('Error:', e);
    }
}
main();
