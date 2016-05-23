const babelify = require('babelify');
const browserifyInc = require('browserify-incremental');
const browserify = require('browserify');

const xtend = require('xtend');
const path = require('path');

const env = require('../misc/env');

module.exports = (dir, file, stream, options) => {
  // inc compile doesnt work on my macs ... set to true if this stops being the case
  const incremental = process.platform !== 'darwin';
  const compress = process.env.NODE_ENV === 'production';
  const debug = process.env.NODE_ENV !== 'production';
  const b = browserify(
    xtend(browserifyInc.args, options || {
      fullPaths: !compress,
      sourcemaps: true, //!compress,
      debug,
      paths: [dir],
    })
  ).transform(babelify.configure({
    sourceMapRelative: dir,
  }));

  if (incremental) {
    browserifyInc(b, {
      cacheFile: path.resolve(`${env.tmpDir}./browserify-cache.json`),
    });
  }

  b.add(path.resolve(dir, file));

  if (compress) {
    b.transform({
      global: true,
    }, 'uglifyify');
  }

  const bundle = b.bundle();

  bundle.on('error', (err) => {
    stream.emit('error', err);
  });

  bundle.pipe(stream);

  bundle.on('end', () => {
    stream.emit('end');
  });
};
