import ora from 'ora';
import { createRunner } from './utils';
import logSymbols from 'log-symbols';

const runner = (browser) => async (url) => {
    const spinner = ora(`Check for errors ${ url }`).start();

    const page = await browser.newPage();
    await page.goto(url);
    const errors = [];

    page.on('console', (err) => {
        console.log(err);
    });
    page.on('error', (err) => {
        console.log(err);
    });

    await page.waitForTimeout(5000);

    await page.close();
    await spinner.stop();
    const hasErrors = errors.length > 0;
    console.log(hasErrors ? logSymbols.error : logSymbols.success, url);
    if (hasErrors) {
        console.table(errors);
    }
    return errors;
}

export async function checkErrors(pages) {
    await createRunner(runner, pages);
}
