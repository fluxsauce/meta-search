#!/usr/bin/env node

const chalk = require('chalk');
const { program } = require('commander');
const forEach = require('lodash/forEach');
const semver = require('semver');
const { table } = require('table');
const metaLib = require('../lib/meta');

const meta = metaLib.get();

let packageName;

/**
 * Check if a value is a SHA1 hash.
 *
 * @param {*} raw - value to be checked
 * @return {boolean} - true if it a hash
 */
function isSha1(raw) {
  return /\b([a-f0-9]{40})\b/.test(raw);
}

/**
 * Parse a package and determine the version or range.
 *
 * @param {string} packageString - dependency or devDependency
 * @return {string} - the clean version, SHA1 hash or range
 */
function determineVersion(packageString) {
  if (packageString.includes('#')) {
    const version = packageString.split('#')[1];
    if (isSha1(version)) {
      return version;
    }
    return semver.clean(version);
  }
  return packageString;
}

/**
 * Colorize a version based on context of a minimum version.
 *
 * @param {string} version - the version to be formatted.
 * @param {string} [minimum] - the version or semver range to format the range.
 * @return {string} the formatted version.
 */
function formatVersion(version, minimum) {
  if (typeof minimum === 'undefined') {
    return version;
  }

  let color;

  // Pinned to a specific hash; can't determine version.
  if (isSha1(version)) {
    color = 'cyan';
  } else if (semver.validRange(version)) {
    // Ranges; typically of npm packages.
    color = semver.intersects(version, minimum) ? 'green' : 'red';
  } else {
    // Pinned version.
    color = semver.satisfies(version, minimum) ? 'green' : 'red';
  }

  return chalk[color](version);
}

/**
 * Determine if a given version satisfies a minimum.
 *
 * @param {string} version - the version to be formatted.
 * @param {string} [minimum] - the version or semver range to format the range.
 * @returns {boolean} true if it does.
 */
function satisfiesVersion(version, minimum) {
  if (typeof minimum === 'undefined') {
    return false;
  }

  // Pinned to a specific hash; can't determine version.
  if (isSha1(version)) {
    return false;
  }

  // Ranges; typically of npm packages.
  if (semver.validRange(version)) {
    return semver.intersects(version, minimum);
  }

  // Pinned version.
  return semver.satisfies(version, minimum);
}

program
  .version('1.0.0')
  .description([
    'package - Find packages in package.json that match given criteria',
    '',
    'Arguments:',
    '  name: Name of the package you are searching for',
  ].join('\n'))
  .arguments('<name>')
  .option('-m, --minimum [semver]', 'Manually specify minimum semantic version. Ex: ">=1.16"')
  .option('-e, --excludeSatisfied', 'Exclude projects that satisfy semantic version')
  .action((name) => {
    // Logical alias.
    packageName = name;

    // Start the table.
    const rows = [
      [chalk.bold('project'), chalk.bold('type'), chalk.bold('version')],
    ];

    // See if there's an "internal" version, meaning a package that is within the meta definition.
    let internalVersion;
    forEach(meta.projects, (repo, path) => {
      // If there's a match...
      if (packageName === path) {
        try {
          // Determine the version of from the match.
          const projectJson = require(`${process.cwd()}/${path}/package.json`); // eslint-disable-line global-require,import/no-dynamic-require
          internalVersion = projectJson.version;
        } catch (err) { // eslint-disable-line no-unused-vars
          // Do nothing.
        }
      }
    });

    // Perform the search.
    forEach(meta.projects, (repo, projectName) => {
      try {
        const projectJson = require(`${process.cwd()}/${projectName}/package.json`); // eslint-disable-line global-require,import/no-dynamic-require
        forEach(['dependencies', 'devDependencies', 'optionalDependencies'], (type) => {
          if (projectJson[type] && projectJson[type][packageName]) {
            const version = determineVersion(projectJson[type][packageName]);

            const minimum = typeof program.minimum === 'undefined' ? internalVersion : program.minimum;
            const render = typeof program.excludeSatisfied === 'undefined' ? true : !satisfiesVersion(version, minimum);

            if (render) {
              rows.push([
                projectName,
                type,
                formatVersion(version, minimum),
              ]);
            }
          }
        });
      } catch (err) { // eslint-disable-line no-unused-vars
        // Do nothing.
      }
    });

    if (rows.length > 1) {
      console.log(table(rows)); // eslint-disable-line no-console
    } else {
      console.log(chalk.yellow('No matching projects.')); // eslint-disable-line no-console
    }
  });

// Show help if no arguments are provided.
if (!process.argv.slice(2).length) {
  program.outputHelp();
} else {
  program.parse(process.argv);
}
