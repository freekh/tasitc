'use strict'

const frontend = require('./frontend')
const spa = require('./spa')
const sharedRoutes = require('../shared/routes')
const preview = require('../shared/preview') //TODO: not right, cus it shouldnt be based of the preview?
const env = require('../shared/env')

const toHTML = require('vdom-to-html')
const hg = require('mercury')
const h = hg.h


const routes = {
  frontend: {
    html: '/',
    javascript: '/js/main.js',
    css: '/css/main.css'
  }
}

const user = 'freekh'
let DB = {
  'freekh/super': {
      type: 'text/html',
      expr: {
        "status":true,
        "value":{
          "path":"html",
          "args":[
            {"path":"ul","args":[
              [
                {"path":"li","args":[
                  {"atom":"string","value":"super"}
                ],"piped":true},
                {"path":"li","args":[
                  {"atom":"string","value":"hot"}
                ],"piped":true},
                {"path":"li","args":[
                  {"atom":"string","value":"hand"}
                ],"piped":true},
                {"path":"li","args":[
                  {"atom":"string","value":"over"}
                ],"piped":true},
                {"path":"li","args":[
                  {"atom":"string","value":"control"}
                ],"piped":true}
              ]
            ]
          }
        ]
      }
    },
    "failed":false
  }
}

module.exports = {
  init: (app) => {
    app.get(routes.frontend.javascript, frontend.js)
    app.get(routes.frontend.html, spa(routes.frontend))
    app.get(routes.frontend.css, frontend.css)

    app.post(sharedRoutes.save, (req, res) => {
      const expr = req.body
      if (expr.status && expr.value && expr.value.value.path === 'html') {
        const path = expr.value.save.replace(/~/, user)
        DB[path] = {
          type: 'text/html',
          expr: expr.value
        }
        console.log('DB', path, DB[path])
        res.send({
          failed: false,
          message: 'Stored at ' + env.server + '/' + path
        })
      } else {
        res.sendStatus(501)
      }
    })

    app.get('/*', (req, res) => {
      const persisted = DB[req.path.slice(1)]
      if (persisted) {
        res.contentType(persisted.type)
        const previewElems = preview(persisted.expr.value, user)

        res.send(toHTML(
           h('html', [
             h('head', h('style', previewElems.css)),
             h('body', previewElems.dom)
           ])
        ))
      } else {
        res.sendStatus(404)
      }
    })
  }
}
