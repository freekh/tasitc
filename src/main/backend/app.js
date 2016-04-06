const express = require('express')
const log = require('../shared/log')
const env = require('../shared/env')
const bodyParser = require('body-parser');

const routes = require('./routes')

const app = express()

app.use(bodyParser.json())

const Delete = require('../../delete/delete')
app.get('/ui-test', (req, res) => {
  res.contentType('text/html')
  res.send(Delete.dom)
})
app.get('/ui-test.css', (req, res) => {
  Delete.css(req, res)
})

app.use('/assets', express.static('./assets'))

routes.init(app)


app.listen(env.port, () => {
  log.info(`initialized on ${env.port}`)
})
