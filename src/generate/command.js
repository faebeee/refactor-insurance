import logSymbols from 'log-symbols';
import path from "path";
import ProgressBar from 'progress';
import { cleanupFolder, createRunner, getScreenshotFolder } from '../utils';
import { printer } from './printer';
import runner from './runner';
import figures from 'figures';

export default async function generate(pages, cwd, cleanup = false, overwrite = false) {
    if (cleanup) {
        console.log(logSymbols.warning, `Cleanup screenshot folder before generating new ones`);
        pages.forEach(({ id }) => {
            const folder = path.join(getScreenshotFolder('original', cwd), id);
            console.log(logSymbols.warning, folder);
            cleanupFolder(folder);
        })
    }

    const totalUrls = pages.reduce((acc, page) => acc + page.urls.length, 0);

    const bar = new ProgressBar(`${ figures.play } Generating [:bar] :current/:total | Progress :percent | ETA :etas | Elapsed :elapsed`, {
        complete: figures.nodejs,
        incomplete: ' ',
        width: 20,
        total: totalUrls,
    });

    await createRunner(runner(cwd, overwrite), pages, printer, () => {
        bar.tick();
    });
    bar.terminate();
}
