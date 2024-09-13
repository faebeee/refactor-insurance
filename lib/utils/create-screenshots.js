import puppeteer from "puppeteer";
import { logger } from "./logger.js";
import fs from 'fs';
import { getScreenshotOutputConfig } from "./get-screenshot-file-name.js";
import ProgressBar from "progress";
import figures from "figures";
import { doesFileExist } from "./fs-utils.js";

export const getBrowser = async (width, height) => {
    logger.debug('Starting browser');
    return puppeteer.launch({
        headless: true,
        devtools: false,
        dumpio: false,
        defaultViewport: {width: width ?? 1600, height: height ?? 1200},
    });
}

/**
 * Creates a screenshot using the given configuration options.
 * @param {PagesConfig} config - The configuration options for creating the screenshot.
 * @param {boolean} overwrite - Overwrite existing screenshots
 * @param {'original' | 'compare'} type - Type of screenshots
 */
export const createScreenshots = async (config, overwrite = false, type = 'original') => {
    const browser = await getBrowser();
    const page = await browser.newPage();

    await page.setViewport({width: config.viewport?.[0] ?? 1080, height: config.viewport?.[1] ?? 1024});

    logger.debug(`Taking screenshots of ${config.pages.length} pages on ${config.url}`);

    const bar = logger.level === 'info' ? new ProgressBar(`Taking Screenshots [:bar] ${figures.play} :url`, {
        complete: figures.nodejs,
        incomplete: ' ',
        width: 20,
        total: config.pages.length,
    }) : null;

    const stats = {
        created: 0,
        skipped: 0,
    };

    for (const index in config.pages) {
        const view = config.pages[index];
        const {file, folder} = getScreenshotOutputConfig(config, view, type);
        const url = `${config.url}${view.path}`
        logger.debug(`${figures.play} Generating screenshot for ${url}`);
        await fs.promises.mkdir(folder, {recursive: true});
        bar?.tick({url})
        if (await doesFileExist(file) && !overwrite) {
            stats.skipped++;
            logger.debug(`Skipping`);
            continue;
        }
        await page.goto(url.toString(), {waitUntil: 'networkidle2'});
        if (view.setup) {
            logger.debug(`Start running custom setup function`);
            await view.setup?.(page);
            logger.debug(`Custom setup complete`);
        }


        await page.screenshot({path: file, fullPage: true});
        logger.debug(`${figures.tick} Screenshot created ${file}`);
        stats.created++;
    }

    bar?.terminate();
    logger.debug(`Generated ${stats.created} screenshots. Skipped ${stats.skipped}`);
    await browser.close();
}