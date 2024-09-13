#!/usr/bin/env node

import { Command } from "commander";
import Pkg from '../package.json' assert { type: 'json' };
import { commandSetup } from "../lib/utils/command-setup.js";
import { createScreenshots } from "../lib/utils/create-screenshots.js";
import { getConfig } from "../lib/utils/get-config.js";
import { compareImages } from "../lib/utils/compare-images.js";

const program = new Command();

program
    .version(Pkg.version)
    .name('refactor')
    .description('Generates screenshots and compares them to a later run to ensure the refactoring did not change anything unintended')
    .option('-v, --verbose', 'be verbose')

program.command('generate')
    .argument('config', 'Path to your config file')
    .option('--only <id>', 'Only executes the command for a given config id')
    .option('--overwrite', 'Generates a new screenshot even if they already exists.')
    .description('Generates new screenshots and overwrites existing ones')
    .action(async (pagesPath, opts) => {
        commandSetup(program);
        const configs = await getConfig(pagesPath);
        for (const index in configs) {
            const config = configs[index];
            if (!opts.only || !!opts.only && config.only === opts.id) {
                await createScreenshots(config, opts.overwrite ?? false)
            }
        }
    });

program.command('compare')
    .argument('config', 'Path to the config .js')
    .option('--only <id>', 'Only executes the command for a given config id')
    .description('Takes new screenshots and compares them to the already created ones')
    .action(async (pagesPath, opts) => {
        commandSetup(program);
        const configs = await getConfig(pagesPath);
        for (const index in configs) {
            const config = configs[index];
            if (!opts.only || !!opts.only && config.only === opts.id) {
                await createScreenshots(config, true, 'compare')
                await compareImages(config);
            }
        }
    });

program.parse();
