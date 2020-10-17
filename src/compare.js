import {
    cleanupFolder,
    ensureFolder,
    getBrowser,
    getFilePath,
    getScreenshotFolder,
    runAuth,
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

const compareWithNewScreenshot = (page, folder, cwd, maxPixelDiff) => async (url) => {
    const spinner = ora(`Comparing ${ url }`).start();

    const newScreenshot = await takeScreenshot(page, folder, true)(url);
    const originalImage = path.join(getScreenshotFolder('original', cwd), getFilePath(url));
    const { isEqual, image, diff } = await compareImages(newScreenshot, originalImage, url, cwd, maxPixelDiff);

    spinner.stop();
    console.log(isEqual ? logSymbols.success : logSymbols.error, url, image, diff);

    if (isEqual) {
        fs.unlinkSync(newScreenshot);
    }
}

const createRunner = (browser, cwd, maxPixelDiff) => async ({ urls, auth }) => {
    if (auth) {
        const page = await browser.newPage();
        await runAuth(page, auth);
    }

    const dir = getScreenshotFolder('compare', cwd);
    const page = await browser.newPage();
    const screenshotRunner = compareWithNewScreenshot(page, dir, cwd, maxPixelDiff);
    for (let i = 0; i < urls.length; i++) {
        await screenshotRunner(urls[i]);
    }
    cleanupFolder(dir);
}

export async function compare(pages, cwd, maxPixelDiff = MAX_PIXEL_DIFF) {
    const browser = await getBrowser();
    const runner = createRunner(browser, cwd, maxPixelDiff);
    for (let i = 0; i < pages.length; i++) {
        await runner(pages[i]);
    }
    await browser.close();
}
