'use strict'

const document = require('global/document')
const hg = require('mercury')
const xtend = require('xtend')
const h = hg.h

const cli = require('./components/cli')

let App = () => {
  return hg.state({
    cli: cli()
  })
}

App.render = (state) => {
  return h('div.container', [
    cli.render(state.cli)
  ])
}

module.exports = () => {
  hg.app(document.body, App(), App.render)
}