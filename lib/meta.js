const fs = require('fs');
const path = require('path');

/**
 * Get the meta configuration file.
 *
 * @returns {Object} meta configuration file
 */
function get() {
  // Check if we're in a meta project directory.
  const inMetaRepo = fs.existsSync('.meta');
  if (!inMetaRepo) {
    throw new Error('Not in a meta project directory!');
  }

  const metaPath = path.resolve('.meta');

  // Try to read the file.
  let buffer;
  try {
    buffer = fs.readFileSync(metaPath);
  } catch (e) {
    throw new Error(`Unable to read .meta file: ${e.message}`);
  }

  // Try to parse the file.
  let meta;
  try {
    meta = JSON.parse(buffer.toString());
  } catch (e) {
    throw new Error(`Unable to parse .meta file: ${e.message}`);
  }

  // Return the parsed result.
  return meta;
}

module.exports = {
  get,
};
