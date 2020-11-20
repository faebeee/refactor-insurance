import { cleanupFolder, createRunner, getScreenshotFolder, hashString } from '../utils';
import printer from './printer';
import runner from './runner';
import ProgressBar from 'progress';

const figures = require('figures');

const MAX_PIXEL_DIFF = 100

export default async function compare(pages, cwd, maxPixelDiff = MAX_PIXEL_DIFF) {
    await cleanupFolder(getScreenshotFolder('compare', cwd));
    await cleanupFolder(getScreenshotFolder('diff', cwd));

    const totalUrls = pages.reduce((acc, page) => acc + page.urls.length, 0);

    const bar = new ProgressBar(`${ figures.play } Comparing [:bar] :current/:total | Progress :percent | ETA :etas | Elapsed :elapsed`, {
        complete: figures.nodejs,
        incomplete: ' ',
        width: 20,
        total: totalUrls,
    });

    await createRunner(runner(cwd, maxPixelDiff), pages, printer, () => {
        bar.tick();
    });

    bar.terminate();
}
