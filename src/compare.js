import logSymbols from 'log-symbols';
import {
    cleanupFolder, compareWithNewScreenshot, createRunner,
    getScreenshotFolder,
} from './utils';

const MAX_PIXEL_DIFF = 100

const compareRunner = (cwd, maxPixelDiff) => (browser) => async (url) => {
    const dir = getScreenshotFolder('compare', cwd);
    const page = await browser.newPage();
    try {
        const { isEqual, image, diff } = await compareWithNewScreenshot(url, page, dir, cwd, maxPixelDiff);
        await cleanupFolder(dir);
        return {
            isEqual,
            url,
            image,
            diff,
        };
    } catch (e) {
        throw e;
    }
    return null;
}

const printer = (id, results) => {
    results.forEach(result => {
        if (result.isEqual) {
            console.log(logSymbols.success, result.url);
        } else {
            console.error(logSymbols.error, `${ result.diff } pixels`, result.image);
        }
    })
}

export async function compare(pages, cwd, maxPixelDiff = MAX_PIXEL_DIFF) {
    await createRunner(`Compare screenshots`, compareRunner(cwd, maxPixelDiff), pages, printer);
}
