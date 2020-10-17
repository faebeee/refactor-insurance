import logSymbols from 'log-symbols';
import ora from 'ora';
import path from 'path';

import { cleanupFolder, createRunner, getScreenshotFolder, takeScreenshot } from './utils';

const generateRunner = (cwd) => (browser) => async (url) => {
    const spinner = ora(`Capturing ${ url }`).start();
    const page = await browser.newPage();
    const screenshotRunner = takeScreenshot(page, getScreenshotFolder('original', cwd));
    const files = screenshotRunner(url);
    spinner.stop();
    return files;
}

export async function generate(pages, cwd, cleanup) {
    if (cleanup) {
        cleanupFolder(path.join(cwd, 'screenshots'));
    }

    const runner = await createRunner(generateRunner(cwd), pages);
    console.log(logSymbols.success, `Created ${ runner.flat().length } screenshots`);
}
