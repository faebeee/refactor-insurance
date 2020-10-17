#!/usr/bin/env node

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const pages = require('./pages.json');
require = require("esm")(module)
const { generate } = require('./src/generate');
const { compare } = require('./src/compare');

yargs(hideBin(process.argv))
    .command('generate', false, (argv) => {
        return generate(pages)
    })
    .command('compare', false, (argv) => {
        return compare(pages)
    })
    .argv
