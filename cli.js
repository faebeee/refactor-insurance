#!/usr/bin/env node
const yargs = require('yargs/yargs')
const path = require('path');
require = require("esm")(module)
const generate = require('./src/generate/command').default;
const compare = require('./src/compare/command').default;
const hash = require('./src/hash').default;
const { list } = require('./src/list');
const { filterById } = require('./src/utils');
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');
const { hashString, getInterpolatedUrls } = require('./src/utils');

updateNotifier({ pkg }).notify();

const argv = yargs(process.argv.slice(2))


argv
    .command({
        command: 'generate [app_id]',
        aliases: ['generate'],
        desc: 'Generate screenshots',
        builder: (yargs) => {},
        handler: (argv) => {
            const cwd = process.cwd();
            const pages = require(path.resolve(cwd, argv.config || './pages.json'));
            const update = argv.update || false;
            const clean = argv.clean || false;
            const id = argv.app_id || null;
            const hash = argv.hash && argv.hash.toString().split(',') || null;
            return generate(processPages(pages, id, hash), argv.folder || cwd, clean, update)
        },
    })
    .command({
        command: 'compare [app_id]',
        aliases: ['compare'],
        desc: 'Compare existing screenshots with new ones',
        builder: (yargs) => {},
        handler: (argv) => {
            const cwd = process.cwd();
            const pages = require(path.resolve(cwd, argv.config || './pages.json'));
            const threshold = argv.threshold || undefined;
            const id = argv.app_id || null;
            const hash = argv.hash && argv.hash.toString().split(',') || null;
            return compare(processPages(pages, id, hash), argv.folder || cwd, threshold);
        },
    })
    .command({
        command: 'list',
        aliases: ['list', '$0'],
        desc: 'Show all available pages from config',
        builder: (yargs) => {},
        handler: (argv) => {
            const cwd = process.cwd();
            const pages = require(path.resolve(cwd, argv.config || './pages.json'));
            return list(pages, argv.folder || cwd);
        },
    })
    .command({
        command: 'hashes',
        aliases: ['hash'],
        desc: 'List all urls for a page and it hashes',
        builder: (yargs) => {},
        handler: (argv) => {
            const cwd = process.cwd();
            const pages = require(path.resolve(cwd, argv.config || './pages.json'));
            return hash(pages);
        },
    })
    .option('threshold', {
        alias: 't',
        type: 'number',
        description: 'Max amount of pixel to differ',
    })
    .option('update', {
        alias: 'u',
        type: 'boolean',
        description: 'Overwrite existing screenshots',
    })
    .option('clean', {
        type: 'boolean',
        description: 'Remove old screenshots and update them',
    })
    .option('folder', {
        alias: 'f',
        type: 'folder',
        description: 'Location to store all screenshots',
    })
    .option('hash', {
        alias: 'h',
        type: 'string',
        description: 'Hash for specific URL',
    })
    .option('config', {
        alias: 'c',
        type: 'file',
        description: 'Location of the config file',
    })
    .argv
