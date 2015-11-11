const sass = require('node-sass')

module.exports = () => {
  return new Promise((resolve, reject) => {
    sass.render({
      file: path.resolve(env.appDir + '/src/frontend/main.scss')
    }, function(err, result) {
      if (err) {
        reject(err)
      } else {
        resolve(result)
      }
    });
  })
}
