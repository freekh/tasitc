'use strict'

const env = require('../shared/env')
const fs = require('fs')

if (!fs.statSync(env.tmpDir).isDirectory()) {
  fs.mkdirSync(env.tmpDir)
}

module.exports = {
  js: require('./build-js.js'),
  css: require('./build-css.js')
}
