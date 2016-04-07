'use strict'

const babelify = require('babelify')
const browserifyInc = require('browserify-incremental')
const browserify = require('browserify')

const xtend = require('xtend')
const path = require('path')

const env = require('../main/shared/env')

module.exports = (stream, incremental, options) => {
  const frontendDir = path.resolve(env.appDir + '/src/delete')

  let b = browserify(
    xtend(browserifyInc.args, options || {
      debug: true
    })
  ).transform(babelify.configure({
    sourceMapRelative: frontendDir
  }))

  if (incremental) {
    browserifyInc(b, {
      cacheFile: path.resolve(env.tmpDir + './browserify-cache.json')
    })
  }

  b.add(frontendDir + '/frontend.js')

  const bundle = b.bundle()

  bundle.on('error', (err) => {
    stream.emit('error', err)
  })

  bundle.pipe(stream)

  bundle.on('end', () => {
    stream.emit('end')
  })
}
