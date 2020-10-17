import { getBrowser, getScreenshotFolder, runAuth, takeScreenshot } from './src/utils';
const pages = require('./pages.json');

const createRunner = (browser) => async ({ urls, auth }) => {
    if (auth) {
        const page = await browser.newPage();
        await runAuth(page, auth);
    }

    const page = await browser.newPage();
    const screenshotRunner = takeScreenshot(page, getScreenshotFolder('original'));
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
