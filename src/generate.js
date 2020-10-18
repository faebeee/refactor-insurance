import logSymbols from 'log-symbols';
import path from 'path';

import { cleanupFolder, createRunner, getScreenshotFolder, takeScreenshot } from './utils';

const generateRunner = (cwd) => (browser) => async (url) => {
    const page = await browser.newPage();
    const screenshotRunner = takeScreenshot(page, getScreenshotFolder('original', cwd));
    const file = await screenshotRunner(url);

    return {
        file,
        url,
    }
}

const printer = (id, results) => {
    console.log(logSymbols.success, `Created ${ results.length } screenshots for ${ id }`);
}

export async function generate(pages, cwd, cleanup) {
    if (cleanup) {
        console.log(logSymbols.warning, `Cleanup screenshot folder before generating new ones`);
        cleanupFolder(path.join(cwd, 'screenshots'));
    }

    return createRunner('Generate Screenshots', generateRunner(cwd), pages, printer);
}
