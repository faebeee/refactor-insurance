import logSymbols from 'log-symbols';
import ora from 'ora';
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';

export const runAuth = async (page, { url, steps, submit }) => {
    const spinner = ora(`Logging in ${ url }`).start();

    await page.goto(url);

    for (let i = 0; i < steps.length; i++) {
        const { selector, text } = steps[i];
        await page.type(selector, text, { delay: 50 });
    }

    await page.click(submit);
    await page.waitForTimeout(2000);
    await page.close();
    await spinner.stop();
    console.log(logSymbols.success, 'Auth completed!');
}

export const cleanupFolder = (dir) => fs.promises.rmdir(dir, { recursive: true });

export const getScreenshotFolder = (group, cwd) => {
    return path.join(cwd, './screenshots', group);
}

export const getHostName = (urlString) => {
    const { host } = new URL(urlString);
    return host;
}

export const generateFileName = (urlString) => {
    const { host, pathname } = new URL(urlString);
    const fileName = pathname.replace(/\//g, '_');
    return `${ host }_${ fileName }.png`;
}

export const getFilePath = (url) => {
    return path.join(getHostName(url), generateFileName(url));
}

export const ensureFolder = (folder) => fs.promises.mkdir(folder, { recursive: true });

export const getBrowser = () => {
    return puppeteer.launch({ headless: true, devtools: false, dumpio: false, defaultViewport: { width: 1440, height: 800 } });
}

export const doesFileExist = async (file) => {
    try {
        const fileAlreadyExists = await fs.promises.stat(file);

        return !!fileAlreadyExists;
    } catch {

    }
    return false
}

export const takeScreenshot = (page, storeFolder, overwrite = false) => async (url) => {
    const folder = path.join(storeFolder, getHostName(url));
    await ensureFolder(folder);
    const file = path.join(storeFolder, getFilePath(url));

    if (!overwrite && await doesFileExist(file)) {
        return null;
    }

    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: file, fullPage: true, });
    return file;
}

export const createRunner = async (runnerFactory, pages) => {
    const browser = await getBrowser();

    const runner = runnerFactory(browser);
    const results = [];

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (page.auth) {
            const browserPage = await browser.newPage();
            await runAuth(browserPage, page.auth);
        }
        const { urls } = page;

        for (let x = 0; x < urls.length; x++) {
            const url = urls[x];
            results.push(await runner(url));
        }
    }

    await browser.close();
    return results;
}
