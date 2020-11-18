import logSymbols from 'log-symbols';
import {
    cleanupFolder, compareWithNewScreenshot, createRunner,
    getScreenshotFolder,
} from './utils';

const MAX_PIXEL_DIFF = 100

const compareRunner = (cwd, maxPixelDiff) => (browser) => async (url, bar) => {
    const dir = getScreenshotFolder('compare', cwd);
    const page = await browser.newPage();
    try {
        const { isEqual, image, diff } = await compareWithNewScreenshot(url, page, dir, cwd, maxPixelDiff);
        await cleanupFolder(dir);
        await page.close();
        return {
            isEqual,
            url,
            image,
            diff,
        };
    } catch (e) {
        await page.close();
        throw e;
    }
}

const printer = (id, results) => {

}

const progressPrinter = (bar, result) => {
    if (!result.isEqual) {
        bar.interrupt(`${ logSymbols.error } ${ result.url }`);
    }
}

export async function compare(pages, cwd, maxPixelDiff = MAX_PIXEL_DIFF) {
    await cleanupFolder(getScreenshotFolder('compare', cwd))
    await cleanupFolder(getScreenshotFolder('diff', cwd))

    await createRunner(`Compare screenshots`, compareRunner(cwd, maxPixelDiff), pages, printer, progressPrinter);
}
