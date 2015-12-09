const frontend = require('./frontend')
const spa = require('./spa')

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
  }
}
