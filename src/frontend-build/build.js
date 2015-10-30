'use strict'

const babelify = require('babelify')
const browserifyInc = require('browserify-incremental')
const browserify = require('browserify')
const xtend = require('xtend')
const env = require('../shared/env')
const path = require('path')
const fs = require('fs')

if (!fs.statSync(env.tmpDir).isDirectory()) {
  fs.mkdirSync(env.tmpDir)
}

module.exports = (stream, incremental, options) => {
  const frontendDir = path.resolve(env.appDir + '/src/frontend')

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
