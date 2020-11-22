import path from "path";
import { cleanupFolder, createRunner, getScreenshotFolder } from '../utils';
import runner from './runner';

export default async function generate(pages, cwd, onComplete, onProgress, cleanup = false, overwrite = false) {
    if (cleanup) {
        pages.forEach(({ id }) => {
            const folder = path.join(getScreenshotFolder('original', cwd), id);
            cleanupFolder(folder);
        })
    }

    await createRunner(runner(cwd, overwrite), pages, onComplete, onProgress);
}
