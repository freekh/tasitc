const build = require('../frontend-build/build')
const log = require('../shared/log')

module.exports = {
  js: (req, res) => {
    res.contentType('application/javascript')
    build.js(res, true)
    res.on('error', (err) => {
      log.error(err.stack)
      res.sendStatus(500)
    })
  },
  css: (req, res) => {
    res.contentType('text/css')
    build.css().then((css) => {
      res.send(css.toString())
    }).catch(err => {
      log.error(err)
      res.sendStatus(500)
    })
  }
}
