import logSymbols from 'log-symbols';
import ora from 'ora';

import { getBrowser, getScreenshotFolder, runAuth, takeScreenshot } from './utils';

const createRunner = (browser) => async ({ urls, auth }) => {
    if (auth) {
        const page = await browser.newPage();
        await runAuth(page, auth);
        console.log(logSymbols.success, 'Auth completed!');
    }

    const screenshots = [];
    const page = await browser.newPage();
    const screenshotRunner = takeScreenshot(page, getScreenshotFolder('original'));


    for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const spinner = ora(`${ i }/${ urls.length } Capturing ${ url }`).start();
        const file = await screenshotRunner(url);
        spinner.stop();
        console.log(!!file ? logSymbols.success : logSymbols.warning, url);
        if (file) {
            screenshots.push(file);
        }
    }
    return screenshots;
}

export async function generate(pages) {
    const browser = await getBrowser();
    const runner = createRunner(browser);

    const createdScreens = [];

    for (let i = 0; i < pages.length; i++) {
        const files = await runner(pages[i]);
        createdScreens.push(...files);
    }

    console.log(logSymbols.success, `Created ${ createdScreens.length } screenshots`);

    await browser.close();
}
