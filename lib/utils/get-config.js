import path from "path";
import { logger } from "./logger.js";

/**
 * @typedef PagesEntry
 * @type {object}
 * @property {string} id
 * @property {string} path
 * @property {((page: import('puppeteer').Page) => Promise<void>)?} setup
 */

/**
 * Asynchronously retrieves a configuration object from a specified file path.
 *
 * @param {string} pathToFile - The file path to the configuration file.
 * @returns {Promise<Array<PagesConfig>>} - A promise that resolves to the retrieved config object.
 *
 * @typedef PagesConfig
 * @type {object}
 * @property {string} id - ID of the configuration
 * @property {string} url - Baseurl
 * @property {[number, number]?} viewport - Optional custom viewport
 * @property {string} output - Output directory
 * @property {Array<PagesEntry>} pages - List of pages to screenshot and compare
 */
export const getConfig = async (pathToFile) => {
    const file = path.resolve(process.cwd(), pathToFile);
    logger.debug(`Loading configuration from ${file}`)
    const config = await import(file);
    logger.debug(`Config ${config.default.id} loaded`)
    return config.default;
}