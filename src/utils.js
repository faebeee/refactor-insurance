import logSymbols from 'log-symbols';
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import ProgressBar from 'progress';

const figures = require('figures');

export const filterById = (_id) => ({ id }) => _id ? id === _id : true;

export const compareImages = async (fileA, fileB, url, cwd, maxPixelDiff = MAX_PIXEL_DIFF) => {
    const img1 = PNG.sync.read(fs.readFileSync(fileA));
    const img2 = PNG.sync.read(fs.readFileSync(fileB));
    const { width, height } = img1;
    const diff = new PNG({ width, height });

    try {
        const pixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.2 });
        const diffFolder = getScreenshotFolder('diff', cwd);
        const diffFile = path.join(diffFolder, getFilePath(url));

        if (pixels > maxPixelDiff) {
            await ensureFolder(path.dirname(diffFile));
            fs.writeFileSync(diffFile, PNG.sync.write(diff));
        }

        return {
            isEqual: pixels <= maxPixelDiff,
            diff: pixels,
            image: diffFile,
        };
    } catch (e) {
        console.log(fileA);
        console.log(fileB);
        throw e;
    }
}

export const compareWithNewScreenshot = async (url, page, folder, cwd, maxPixelDiff) => {
    const newScreenshot = await takeScreenshot(page, folder, true)(url);
    const originalImage = path.join(getScreenshotFolder('original', cwd), getFilePath(url));
    const { isEqual, image, diff } = await compareImages(newScreenshot, originalImage, url, cwd, maxPixelDiff);

    if (isEqual) {
        fs.unlinkSync(newScreenshot);
    }

    return { isEqual, image, diff };
}

export const runAuth = async (page, { auth }) => {
    const { url, steps, submit } = auth
    await page.goto(url);

    for (let i = 0; i < steps.length; i++) {
        const { selector, text } = steps[i];
        await page.type(selector, text, { delay: 50 });
    }

    await page.click(submit);
    await page.waitForTimeout(2000);
    await page.close();
}

export const cleanupFolder = (dir) => fs.promises.rmdir(dir, { recursive: true });

export const getScreenshotFolder = (group, cwd) => path.join(cwd, './screenshots', group);

export const getHostName = (urlString) => {
    const { host } = new URL(urlString);
    return host;
}

export const generateFileName = (urlString) => {
    const { host, pathname, search } = new URL(urlString);
    const fileName = pathname.replace(/\//g, '_');
    return `${ host }_${ fileName }${search}.png`;
}

export const getFilePath = (url) => path.join(getHostName(url), generateFileName(url));

export const ensureFolder = (folder) => fs.promises.mkdir(folder, { recursive: true });

export const getBrowser = () => puppeteer.launch({
    headless: true,
    devtools: false,
    dumpio: false,
    defaultViewport: { width: 1440, height: 800 },
});

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
    await page.screenshot({ path: file, fullPage: false });
    return file;
}

const createUrlInterpolator = (map) => (url) => {
    return Object.entries(map).reduce((acc, [key, value]) => {
        acc = acc.replace(`%${ key }%`, value);
        return acc;
    }, url)
}

const createUrlRunner = (workTitle, runner, progressPrinter = () => {}) => async (urls) => {
    const bar = new ProgressBar(`${ figures.play } ${ workTitle } [:bar] :current/:total | Progress :percent | ETA :etas | Elapsed :elapsed`, {
        complete: figures.nodejs,
        incomplete: ' ',
        width: 20,
        total: urls.length,
        // clear: true,
    });

    const results = [];

    for (let x = 0; x < urls.length; x++) {
        const url = urls[x];
        bar.tick({ url });
        try {
            const result = await runner(url, bar);
            progressPrinter(bar, result)
            results.push(result);
        } catch (e) {
            bar.interrupt(`${ e.message } - ${ url }`);
        }
    }
    bar.clear();
    return results;
}

export const createRunner = async (workTitle, runnerFactory, pages, printer, progressPrinter) => {
    const browser = await getBrowser();
    const runner = createUrlRunner(workTitle, runnerFactory(browser), progressPrinter);

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        console.log(figures.pointer, `Page ${ page.id }`);

        try {
            if (page.auth) {
                const browserPage = await browser.newPage();
                await runAuth(browserPage, page);
            }

            const { urls } = page;
            const interpolator = createUrlInterpolator({
                base_url: page.base_url,
            });
            const interpolatedUrls = urls.map((url) => {
                return interpolator(url)
            })
            printer(page.id, await runner(interpolatedUrls));
        } catch (e) {
            console.error(logSymbols.error, e);
        }
    }
    await browser.close();
}
