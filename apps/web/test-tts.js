const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

async function test() {
    console.log('Testing TTS...');
    try {
        const tts = new MsEdgeTTS();
        console.log('setting metadata...');
        await tts.setMetadata('zh-CN-YunxiNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
        console.log('metadata set!');
        return;
    } catch (e) {
        console.error('Error:', e);
    }
}
test();
