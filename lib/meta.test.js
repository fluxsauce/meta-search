const fs = require('fs');
const path = require('path');
const meta = require('./meta');

jest.mock('fs');
jest.mock('path');

describe('./lib/meta.js', () => {
  beforeAll(() => {
    path.resolve.mockReturnValue('shrug');
  });

  test('throws if not in meta directory', () => {
    fs.existsSync.mockReturnValueOnce(false);
    expect(() => {
      meta.get();
    }).toThrow('Not in a meta project directory!');
  });

  test('throws if meta file is unreadable', () => {
    fs.existsSync.mockReturnValueOnce(true);
    fs.readFileSync.mockImplementation(() => {
      throw new Error('foo');
    });
    expect(() => {
      meta.get();
    }).toThrow('Unable to read .meta file: foo');
  });

  test('throws if file is unparseable', () => {
    fs.existsSync.mockReturnValueOnce(true);
    fs.readFileSync.mockImplementation(() => Buffer.from('fail'));
    expect(() => {
      meta.get();
    }).toThrow('Unable to parse .meta file: Unexpected token i in JSON at position 2');
  });

  test('returns a meta projects file if there are no problems', () => {
    fs.existsSync.mockReturnValueOnce(true);
    fs.readFileSync.mockImplementation(() => Buffer.from('{"projects":{"meta-search":"git@github.com:fluxsauce/meta-search.git"}}'));
    expect(meta.get())
      .toStrictEqual({
        projects: {
          'meta-search': 'git@github.com:fluxsauce/meta-search.git',
        },
      });
  });
});
