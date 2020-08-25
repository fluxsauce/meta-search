#!/usr/bin/env node

const program = require('commander');

let loaded = false;
if (!loaded) {
  program
    .command('package', 'Find packages in package.json that match given criteria')
    .parse(process.argv);
  loaded = true;
}
