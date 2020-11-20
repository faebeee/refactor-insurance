import { cleanupFolder, compareWithNewScreenshot, getScreenshotFolder } from '../utils';

export const runner = (cwd, maxPixelDiff) => (browser) => async (groupId, url) => {
    const dir = getScreenshotFolder('compare', cwd);
    const page = await browser.newPage();
    try {
        const { isEqual, image, diff } = await compareWithNewScreenshot(groupId, url, page, dir, cwd, maxPixelDiff);
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

export default runner;
