const express = require('express')
const log = require('../shared/log')
const env = require('../shared/env')
const bodyParser = require('body-parser');

const routes = require('./routes')

const app = express()

app.use(bodyParser.json())

routes.init(app)

app.listen(env.port, () => {
  log.info(`initialized on ${env.port}`)
})
