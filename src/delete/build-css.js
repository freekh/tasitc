const sass = require('node-sass')

const path = require('path')

module.exports = () => {
  return new Promise((resolve, reject) => {
    sass.render({
      file: path.resolve('./src/delete/delete.scss')
    }, function(err, result) {
      if (err) {
        reject(err)
      } else {
        console.log(result.css)
        resolve(result.css)
      }
    });
  })
}
