const babelify = require('babelify')
const browserifyInc = require('browserify-incremental')
const browserify = require('browserify')
const xtend = require('xtend')
const env = require('../shared/env')
const path = require('path')

module.exports = (stream, incremental, options) => {
  const frontendDir = path.resolve(env.appDir + '/src/frontend')

  const b = browserify(
    xtend(browserifyInc.args, options || {})
  ).transform(babelify.configure({
    sourceMapRelative: frontendDir
  }))

  if (incremental) {
    browserifyInc(b, {
      cacheFile: path.resolve(env.tmpDir + './browserify-cache.json')
    })
  }

  b.add(frontendDir + '/app.js')
  const bundle = b.bundle()

  bundle.on('error', (err) => {
    stream.emit('error', err)
  })
  bundle.pipe(stream)
  bundle.on('end', () => {
    stream.emit('end')
  })
}
