import path from "path";

/**
 *
 * @param {PagesConfig} config
 * @returns {string}
 */
export const getConfigOutputFolder = (config) => path.resolve(config.output ?? process.cwd());

/**
 * Retrieves the file name for a screenshot based on the provided configuration and entry.
 *
 * @param {PagesConfig} config - The configuration object that contains information about how to generate the screenshot file name.
 * @param {PagesEntry} entry - The entry object that contains relevant data for generating the screenshot file name.
 * @param {'original' | 'compare'} type -
 * @returns {{folder: string, file:string}} The file name for the screenshot.
 *
 */
export const getScreenshotOutputConfig = (config, entry, type = 'original') => {
    const outputDirectory = getConfigOutputFolder(config);
    const folder = path.join(outputDirectory, type, config.id);
    const fileName = `${entry.id}.png`;
    return {
        folder,
        fileName,
        file: path.join(folder, fileName),
    };
}