#!/usr/bin/env node


const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const path = require('path');
require = require("esm")(module)
const { generate } = require('./src/generate');
const { compare } = require('./src/compare');
const { checkErrors } = require('./src/check-errors');

yargs(hideBin(process.argv))
    .command('generate', 'Generate screenshots', ({ argv }) => {
        const cwd = process.cwd();
        const pages = require(path.resolve(cwd, argv.config) || './pages.json');
        const update = argv.update || false;
        return generate(pages, argv.folder || cwd, update)
    })
    .command('compare', 'Compare existing screenshots with new ones', ({ argv }) => {
        const cwd = process.cwd();

        const pages = require(path.resolve(cwd, argv.config) || './pages.json');
        const threshold = argv.threshold || undefined;
        return compare(pages, argv.folder || cwd, threshold);
    })
    .command('check-errors', 'Check of any pages report some errors to the console', ({ argv }) => {
        const cwd = process.cwd();
        const pages = require(path.resolve(cwd, argv.config) || './pages.json');
        return checkErrors(pages);
    })
    .option('threshold', {
        alias: 't',
        type: 'number',
        description: 'Max amount of pixel to differ',
    })
    .option('update', {
        alias: 'u',
        type: 'boolean',
        description: 'Remove old screenshots and update them',
    })
    .option('folder', {
        alias: 'f',
        type: 'folder',
        description: 'Location to store all screenshots',
    })
    .option('config', {
        alias: 'c',
        type: 'file',
        description: 'Location of the config file',
    })
    .argv
