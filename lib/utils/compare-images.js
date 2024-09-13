import { getConfigOutputFolder, getScreenshotOutputConfig } from "./get-screenshot-file-name.js";
import { PNG } from "pngjs";
import fs from "fs";
import pixelmatch from "pixelmatch";
import path from "path";
import ProgressBar from "progress";
import figures from "figures";
import { logger } from "./logger.js";
import { cleanupFolder, ensureFolder } from "./fs-utils.js";

const MAX_PIXEL_DIFF = 100;

/**
 *
 * @param {PagesConfig} config
 */
export const compareImages = async (config) => {
    const results = [];
    const bar = logger.level === 'info' ? new ProgressBar(`Comparing [:bar] :id`, {
        complete: figures.nodejs,
        incomplete: ' ',
        width: 20,
        total: config.pages.length,
    }) : null;
    const diffFolder = path.join(getConfigOutputFolder(config), 'diff')
    const compareFolder = path.join(getConfigOutputFolder(config), 'compare')
    await ensureFolder(diffFolder);

    for (const index in config.pages) {
        const view = config.pages[index];
        bar?.tick({
            id: view.id
        });

        logger.debug(`Comparing ${view.id}`);
        const original = getScreenshotOutputConfig(config, view, 'original');
        const compare = getScreenshotOutputConfig(config, view, 'compare');

        const img1 = PNG.sync.read(fs.readFileSync(original.file));
        const img2 = PNG.sync.read(fs.readFileSync(compare.file));
        const {width, height} = img1;
        const diff = new PNG({width, height});

        const pixels = pixelmatch(img1.data, img2.data, diff.data, width, height, {threshold: 0.2});
        const diffFile = path.join(diffFolder, `${view.id}.png`);
        const pass = pixels <= MAX_PIXEL_DIFF

        if (!pass) {
            fs.writeFileSync(diffFile, PNG.sync.write(diff));
            logger.debug(`${figures.cross} Diff detected ${diffFile}`)
        }else{
            logger.debug(`${figures.tick} ${view.id} unchanged`)
        }

        results.push({
            url: `${config.url}${view.path}`,
            id: view.id,
            pass: pass,
            file: diffFile
        });
    }
    bar?.terminate();
    await cleanupFolder(compareFolder)

    const hasFailed = results.find((entry) => !entry.pass);

    results.forEach((entry) => {
        if (!entry.pass) {
            logger.error(`${figures.cross} ${entry.id}`)
            logger.error(`${entry.file}`)
        }
    });

    if (hasFailed) {
        logger.error('Test failed')
        process.exit(1)
    } else {
        logger.info('Test succeeded')
    }
}