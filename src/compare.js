import {
    cleanupFolder, createRunner,
    ensureFolder,
    getFilePath,
    getScreenshotFolder,
    takeScreenshot,
} from './utils';
import logSymbols from 'log-symbols';

const path = require('path');
const fs = require('fs');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const ora = require('ora');

const MAX_PIXEL_DIFF = 100

const compareImages = async (fileA, fileB, url, cwd, maxPixelDiff = MAX_PIXEL_DIFF) => {
    const img1 = PNG.sync.read(fs.readFileSync(fileA));
    const img2 = PNG.sync.read(fs.readFileSync(fileB));
    const { width, height } = img1;
    const diff = new PNG({ width, height });

    const pixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.2 });
    const diffFolder = getScreenshotFolder('diff', cwd);
    const diffFile = path.join(diffFolder, getFilePath(url));

    if (pixels > maxPixelDiff) {
        await ensureFolder(path.dirname(diffFile));
        fs.writeFileSync(diffFile, PNG.sync.write(diff));
    }

    return {
        isEqual: pixels <= maxPixelDiff,
        diff: pixels,
        image: diffFile,
    };
}

const compareWithNewScreenshot = async (url, page, folder, cwd, maxPixelDiff) => {
    const newScreenshot = await takeScreenshot(page, folder, true)(url);
    const originalImage = path.join(getScreenshotFolder('original', cwd), getFilePath(url));
    const { isEqual, image, diff } = await compareImages(newScreenshot, originalImage, url, cwd, maxPixelDiff);

    if (isEqual) {
        fs.unlinkSync(newScreenshot);
    }

    return { isEqual, image, diff };
}

const compareRunner = (cwd, maxPixelDiff) => (browser) => async (url) => {
    const spinner = ora(`Compare ${ url }`).start();
    const dir = getScreenshotFolder('compare', cwd);
    const page = await browser.newPage();
    const { isEqual, image, diff } = await compareWithNewScreenshot(url, page, dir, cwd, maxPixelDiff);
    await cleanupFolder(dir);
    await spinner.stop();
    console.log(isEqual ? logSymbols.success : logSymbols.error, url, image, diff);
}

export async function compare(pages, cwd, maxPixelDiff = MAX_PIXEL_DIFF) {
    await createRunner(compareRunner(cwd, maxPixelDiff), pages);
}
