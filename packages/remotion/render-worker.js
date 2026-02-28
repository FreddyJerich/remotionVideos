/**
 * 本地渲染脚本 - 使用 Remotion Node API 直接渲染
 * 用于替代 CLI 方式，避开 Node v24 + CLI 兼容性问题
 */

const path = require('path');
const { bundle } = require('@remotion/bundler');
const { renderMedia, selectComposition } = require('@remotion/renderer');

async function main() {
    const [, , propsFile, outputFile, compositionId] = process.argv;

    if (!propsFile || !outputFile || !compositionId) {
        console.error('Usage: node render-worker.js <propsFile> <outputFile> <compositionId>');
        process.exit(1);
    }

    const props = JSON.parse(require('fs').readFileSync(propsFile, 'utf-8'));
    const entryPoint = path.resolve(__dirname, 'src', 'index.ts');

    console.log('[render-worker] Bundling...');
    const bundleLocation = await bundle({
        entryPoint,
        webpackOverride: (config) => config,
    });

    console.log('[render-worker] Selecting composition:', compositionId);
    const composition = await selectComposition({
        serveUrl: bundleLocation,
        id: compositionId,
        inputProps: props,
        browserExecutable: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    });

    console.log('[render-worker] Rendering...');
    await renderMedia({
        composition,
        serveUrl: bundleLocation,
        codec: 'h264',
        outputLocation: outputFile,
        inputProps: props,
        concurrency: 1,
        browserExecutable: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        onProgress: ({ progress }) => {
            process.stdout.write(`\r[render-worker] Progress: ${Math.round(progress * 100)}%`);
        },
    });

    console.log('\n[render-worker] Done!');
    process.exit(0);
}

main().catch((e) => {
    console.error('[render-worker] Error:', e);
    process.exit(1);
});
