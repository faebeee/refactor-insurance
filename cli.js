#!/usr/bin/env node

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
require = require("esm")(module)
const { generate } = require('./src/generate');
const { compare } = require('./src/compare');

yargs(hideBin(process.argv))
    .command('generate', 'Generate screenshots', ({ argv }) => {
        const pages = require(argv.config || './pages.json');
        const cwd = argv.folder || process.cwd();
        const update = argv.update || false;
        return generate(pages, cwd, update)
    })
    .command('compare', 'Compare existing screenshots with new ones', ({ argv }) => {
        const pages = require(argv.config || './pages.json');
        const cwd = argv.folder || process.cwd()
        const threshold = argv.threshold || undefined;
        return compare(pages, cwd, threshold);
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
