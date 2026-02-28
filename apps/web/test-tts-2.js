const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const fs = require('fs');

async function test() {
    console.log('Testing TTS...');
    try {
        const tts = new MsEdgeTTS();
        await tts.setMetadata('zh-CN-YunxiNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

        console.log('Generating audio stream...');
        const readable = tts.toStream('测试一下配音是否卡住');

        const chunks = [];
        readable.on('data', (chunk) => {
            console.log('received chunk of size', chunk.length);
            chunks.push(chunk);
        });

        readable.on('end', () => {
            console.log('Stream ended. Total chunks:', chunks.length);
            process.exit(0);
        });

        readable.on('error', (err) => {
            console.error('Stream error:', err);
            process.exit(1);
        });

    } catch (e) {
        console.error('Error:', e);
    }
}
test();
