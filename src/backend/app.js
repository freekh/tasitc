const express = require('express')
const log = require('../shared/log')
const env = require('../shared/env')

const frontend = require('./frontend')
const spa = require('./spa')

const app = express()

const routes = {
  frontend: {
    html: '/',
    javascript: '/js/main'
  }
}

app.get(routes.frontend.javascript, frontend)
app.get(routes.frontend.html, spa(routes.frontend))

app.listen(env.port, () => {
  log.info(`initialized on ${env.port}`)
})
