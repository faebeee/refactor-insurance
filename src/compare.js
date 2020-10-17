import {
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
const pages = require('../pages.json');
const PNG = require('pngjs').PNG;
const pixelmatch = require('pixelmatch');
const ora = require('ora');

const MAX_PIXEL_DIFF = 100

const compareImages = async (fileA, fileB, url) => {
    const img1 = PNG.sync.read(fs.readFileSync(fileA));
    const img2 = PNG.sync.read(fs.readFileSync(fileB));
    const { width, height } = img1;
    const diff = new PNG({ width, height });

    const pixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.2 });
    const diffFolder = getScreenshotFolder('diff');
    const diffFile = path.join(diffFolder, getFilePath(url));

    if (pixels > MAX_PIXEL_DIFF) {
        await ensureFolder(path.dirname(diffFile));
        fs.writeFileSync(diffFile, PNG.sync.write(diff));
    }

    return {
        isEqual: pixels <= MAX_PIXEL_DIFF,
        image: diffFile,
    };
}

const compareWithNewScreenshot = (page, folder) => async (url) => {
    const spinner = ora(`Comparing ${url}`).start();

    const newScreenshot = await takeScreenshot(page, folder)(url);
    const originalImage = path.join(getScreenshotFolder('original'), getFilePath(url));
    const { isEqual, image } = await compareImages(newScreenshot, originalImage, url);

    spinner.stop();
    console.log(isEqual ? logSymbols.success : logSymbols.error, url, image);

    if (isEqual) {
        fs.unlinkSync(newScreenshot);
    }
}

const createRunner = (browser) => async ({ urls, auth }) => {
    if (auth) {
        const page = await browser.newPage();
        await runAuth(page, auth);
    }

    const page = await browser.newPage();
    const screenshotRunner = compareWithNewScreenshot(page, getScreenshotFolder('compare'));
    for (let i = 0; i < urls.length; i++) {
        await screenshotRunner(urls[i]);
    }
}

(async () => {
    const browser = await getBrowser();
    const runner = createRunner(browser);
    for (let i = 0; i < pages.length; i++) {
        await runner(pages[i]);
    }
    await browser.close();
})();
