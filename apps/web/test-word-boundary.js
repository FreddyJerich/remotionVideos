const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');

async function test() {
    const tts = new MsEdgeTTS();
    await tts.setMetadata('zh-CN-YunxiNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3, {
        wordBoundaryEnabled: true,
        sentenceBoundaryEnabled: true
    });

    const { audioStream, metadataStream } = tts.toStream('测试第一句。测试第二句');

    metadataStream.on('data', d => console.log('META:', d.toString()));
    audioStream.on('data', () => { });

    audioStream.on('end', () => {
        console.log('DONE');
        tts.close();
    });
}
test().catch(console.error);
