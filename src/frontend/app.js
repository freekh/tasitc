'use strict'

const document = require('global/document')
const hg = require('mercury')
const xtend = require('xtend')
const h = hg.h

let App = () => {
  return hg.state({})
}

App.render = (state) => {
  return h('div.container')
}

hg.app(document.body, App(), App.render)
