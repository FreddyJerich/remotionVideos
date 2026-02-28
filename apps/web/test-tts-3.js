const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const fs = require('fs');

async function test() {
    console.log('Testing TTS 3...');
    try {
        const tts = new MsEdgeTTS();
        await tts.setMetadata('zh-CN-YunxiNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

        console.log('Generating audio stream...');
        const streamInfo = tts.toStream('测试一下');
        const audioStream = streamInfo.audioStream;

        console.log('is audioStream a Readable?', typeof audioStream.on);

        const chunks = [];
        audioStream.on('data', (c) => chunks.push(c));

        audioStream.on('end', () => console.log('end emitted, chunks', chunks.length));
        audioStream.on('close', () => {
            console.log('close emitted, chunks', chunks.length);
            process.exit(0);
        });
        audioStream.on('error', (e) => console.log('error emitted', e));

    } catch (e) {
        console.error('Error:', e);
    }
}
test();
