import { logger } from "./logger.js";

export const commandSetup = (program) => {
    const quiet = program.opts().quiet;
    if (quiet) {
        logger.level = 'silent';
    }

    const verbose = program.opts().verbose;
    if (verbose) {
        logger.level = 'debug'
    }
    logger.info(`Set logger level to ${logger.level}`);
}