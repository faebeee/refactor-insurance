import { getScreenshotFolder, takeScreenshot } from '../utils';

export const runner = (cwd, overwrite) => (browser) => async (groupId, url) => {
    const page = await browser.newPage();
    const screenshotRunner = takeScreenshot(page, getScreenshotFolder('original', cwd), overwrite);
    const file = await screenshotRunner(groupId, url);
    await page.close();
    return {
        file,
        url,
    };
}

export default runner;
