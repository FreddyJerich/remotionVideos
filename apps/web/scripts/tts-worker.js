const { MsEdgeTTS, OUTPUT_FORMAT } = require('msedge-tts');
const fs = require('fs');

async function main() {
    const textFile = process.argv[2];
    const outputFile = process.argv[3];

    if (!textFile || !outputFile) {
        console.error('Usage: node tts-worker.js "textFile" "outputFile"');
        process.exit(1);
    }

    try {
        const text = fs.readFileSync(textFile, 'utf-8');
        const tts = new MsEdgeTTS();
        await tts.setMetadata('zh-CN-YunxiNeural', OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

        await new Promise((resolve, reject) => {
            const { audioStream } = tts.toStream(text);
            const chunks = [];
            audioStream.on('data', c => chunks.push(c));
            audioStream.on('error', e => reject(e));
            audioStream.on('end', () => {
                fs.writeFileSync(outputFile, Buffer.concat(chunks));
                tts.close();
                resolve();
            });
        });

        console.log('SUCCESS');
        process.exit(0);
    } catch (e) {
        console.error('ERROR:', e.message);
        process.exit(1);
    }
}

main();
