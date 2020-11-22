import { cleanupFolder, createRunner, getScreenshotFolder } from '../utils';
import runner from './runner';

const MAX_PIXEL_DIFF = 100

export default async function compare(pages, cwd, onComplete, onProgress, maxPixelDiff = MAX_PIXEL_DIFF, ) {
    await cleanupFolder(getScreenshotFolder('compare', cwd));
    await cleanupFolder(getScreenshotFolder('diff', cwd));
    await createRunner(runner(cwd, maxPixelDiff), pages, onComplete, onProgress);
}
