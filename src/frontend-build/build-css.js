const sass = require('node-sass')

const path = require('path')
const env = require('../shared/env')

module.exports = (stream) => {
  return new Promise((resolve, reject) => {
    sass.render({
      file: path.resolve(env.appDir + '/src/frontend/main.scss')
    }, function(err, result) {
      if (err) {
        reject(err)
      } else {
        resolve(result.css)
      }
    });
  })
}
