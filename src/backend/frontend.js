const build = require('../frontend-build/build')
const log = require('../shared/log')

module.exports = (req, res) => {
  res.contentType('application/javascript')
  build(res, true)
  res.on('error', (err) => {
    log.error(err.stack)
    res.sendStatus(500)
  })
}
