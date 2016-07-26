const babelify = require('babelify');
const browserifyInc = require('browserify-incremental');
const browserify = require('browserify');

const xtend = require('xtend');
const path = require('path');

const env = require('./env');

module.exports = (files, options) => {
  // inc compile doesnt work on my macs ... set to true if this stops being the case
  const incremental = process.platform !== 'darwin';
  const compress = process.env.NODE_ENV === 'production';
  const debug = process.env.NODE_ENV !== 'production';
  const b = browserify(
    xtend(browserifyInc.args, options || {
      fullPaths: !compress,
      sourcemaps: !compress,
      standalone: 'tasitc',
      debug,
    })
  ).transform(babelify.configure({
  }));

  if (incremental) {
    browserifyInc(b, {
      cacheFile: path.resolve(`${env.tmpDir}./browserify-cache.json`),
    });
  }

  files.forEach(file => {
    b.add(path.resolve(file));
  });

  b.transform('babelify', { presets: ['es2015'] });
  if (compress) {
    b.transform({
      global: true,
    }, 'uglifyify');
  }
  return new Promise((resolve, reject) => {
    const bundle = b.bundle();

    bundle.on('error', (err) => {
      reject(err);
    });

    const buffers = [];
    bundle.on('data', buffer => {
      buffers.push(buffer); // This is better? than buffer = Buffer.concat...?
    });

    bundle.on('end', () => {
      resolve(Buffer.concat(buffers));
    });
  });
};
