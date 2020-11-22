import logSymbols from 'log-symbols';
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

export const filterById = (_id) => ({ id }) => _id ? id === _id : true;

export const hashString = (input) => {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return String(hash);
}

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

export const compareWithNewScreenshot = async (groupId, url, page, folder, cwd, maxPixelDiff) => {
    const newScreenshot = await takeScreenshot(page, folder, true)(groupId, url);
    const originalImage = path.join(getScreenshotFolder('original', cwd), groupId, generateFileName(url));
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
    return `${ host }_${ fileName }${ search }.png`;
}

export const getFilePath = (url) => path.join(getHostName(url), generateFileName(url));

export const ensureFolder = (folder) => fs.promises.mkdir(folder, { recursive: true });

export const getBrowser = () => puppeteer.launch({
    headless: true,
    devtools: false,
    dumpio: false,
    defaultViewport: { width: 1600, height: 1200 },
});

export const doesFileExist = async (file) => {
    try {
        const fileAlreadyExists = await fs.promises.stat(file);
        return !!fileAlreadyExists;
    } catch {

    }
    return false
}


export const processPages = (pages, id, hash) => {
    return pages
        .filter(filterById(id))
        .map(page => ({
            ...page,
            urls: getInterpolatedUrls(page),
        }))
        .map((page) => ({
            ...page,
            urls: page.urls.filter((url) => {
                return (hash ? hash.includes(hashString(url)) : true)
            }),
        }));
}

export const takeScreenshot = (page, storeFolder, overwrite = false) => async (groupId, url) => {
    const folder = path.join(storeFolder, groupId);
    await ensureFolder(folder);
    const file = path.join(storeFolder, groupId, generateFileName(url));

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

const createUrlRunner = (runner, progressPrinter, errorPrinter) => async (groupId, urls) => {
    const results = [];

    for (let x = 0; x < urls.length; x++) {
        const url = urls[x];
        try {
            const result = await runner(groupId, url);
            progressPrinter(groupId, url, result, x, urls.length)
            results.push(result);
        } catch (e) {
            errorPrinter(e, url);
        }
    }
    return results;
}

export const getInterpolatedUrls = (page) => {
    const interpolator = createUrlInterpolator({
        base_url: page.base_url,
    });
    return page.urls.map((url) => {
        return interpolator(url)
    })
}

export const createRunner = async (runnerFactory, pages, printer, progressPrinter = () => {}, errorPrinter = () => {}) => {
    const browser = await getBrowser();
    const runner = createUrlRunner(runnerFactory(browser), progressPrinter, errorPrinter);

    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        try {
            if (page.urls.length <= 0) {
                console.log(`Skipping ${ page.id }`);
                continue;
            }
            if (page.auth) {
                const browserPage = await browser.newPage();
                await runAuth(browserPage, page);
            }

            const { id } = page;
            printer(page.id, await runner(id, page.urls));
        } catch (e) {
            console.error(logSymbols.error, e);
        }
    }
    await browser.close();
}
