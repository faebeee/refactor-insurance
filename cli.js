#!/usr/bin/env node

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const path = require('path');
require = require("esm")(module)
const { generate } = require('./src/generate');
const { compare } = require('./src/compare');
const { filterById } = require('./src/utils');
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');

updateNotifier({pkg}).notify();

yargs(hideBin(process.argv))
    .command('generate', 'Generate screenshots', ({ argv }) => {
        const cwd = process.cwd();
        const pages = require(path.resolve(cwd, argv.config || './pages.json'));
        const update = argv.update || false;
        const id = argv.id || null;

        return generate(pages.filter(filterById(id)), argv.folder || cwd, update)
    })
    .command('compare', 'Compare existing screenshots with new ones', ({ argv }) => {
        const cwd = process.cwd();
        const pages = require(path.resolve(cwd, argv.config || './pages.json'));
        const threshold = argv.threshold || undefined;
        const id = argv.id || null;

        return compare(pages.filter(filterById(id)), argv.folder || cwd, threshold);
    })
    .option('id', {
        alias: 'i',
        type: 'string',
        description: 'The ID of a single config item',
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
