const express = require('express')
const log = require('../shared/log')
const env = require('../shared/env')

const routes = require('./routes')

const app = express()

routes.init(app)

app.listen(env.port, () => {
  log.info(`initialized on ${env.port}`)
})
