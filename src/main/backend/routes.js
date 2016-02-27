const frontend = require('./frontend')
const spa = require('./spa')
const sharedRoutes = require('../shared/routes')
const preview = require('../shared/preview') //TODO: not right, cus it shouldnt be based of the preview?

const vdom2html = require('vdom-to-html')
const hg = require('mercury')
const h = hg.h

const routes = {
  frontend: {
    html: '/',
    javascript: '/js/main.js',
    css: '/css/main.css'
  }
}



module.exports = {
  init: (app) => {
    app.get(routes.frontend.javascript, frontend.js)
    app.get(routes.frontend.html, spa(routes.frontend))
    app.get(routes.frontend.css, frontend.css)
    //
    // const expr = {"status":true,"value":
    //   {"save":"/test",
    //   "value":{"path":"html",
    //     "args":[{"path":"div","args":[{"atom":"string","value":".Foo"},{"atom":"string","value":"jippi"}]},{atom: "string" ,"value":".Foo { color: red; }"}]}}}
    // app.get(expr.value.save, (req, res) => {
    //   console.log(JSON.stringify(expr),   preview(expr))
    //   res.contentType('text/html')
    //   res.send(vdom2html(
    //     h('html', [
    //       h('body', [
    //         preview(expr.value.value)
    //       ])
    //     ])
    //   ))
    // })
    app.post(sharedRoutes.save, (req, res) => {
      const expr = req.body
      if (expr.status && expr.value && expr.value.value.path === 'html') {
        console.log('serving from', expr.value.save)
        const previewElems = preview(expr.value.value)
        app.get(expr.value.save, (req, res) => {
          console.log(JSON.stringify(expr))
          res.contentType('text/html')
          res.send(vdom2html(
            h('html', [
              h('head', h('style', previewElems.css)),
              h('body', previewElems.dom)
            ])
          ))
        })
        res.sendStatus(200)
      }
    })
  }
}
