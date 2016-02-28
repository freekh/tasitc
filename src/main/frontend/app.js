'use strict'

const hg = require('mercury')
const h = hg.h
const xtend = require('xtend')

const Cli = require('./components/cli')
const cli = Cli()

const Preview = require('./components/preview')

const state = hg.state({
  cli: cli.state
})

const render = (state) => {
  return h('div.Container', [
    cli.render(state.cli)
  ])
}

module.exports = () => {
  hg.app(document.body, state, render)

  //TODO: hmm... not sure about this shadow code, but at least it encapsulates css just fine...
  const shadowPreview = document.createElement('div')
  shadowPreview.setAttribute('class', 'Tasitc-Cli-Preview')
  document.body.appendChild(shadowPreview)
  const shadowRoot = shadowPreview.createShadowRoot()
  const preview = Preview(state.cli)
  hg.app(shadowRoot, preview.state, preview.render)
}
