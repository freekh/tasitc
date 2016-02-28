const hg = require('mercury')
const h = hg.h

const preview = require('../../shared/preview')

const state = (cli) => {
  return hg.state({
    cli
  })
}

const render = (state) => {
  console.log(state)
  const previewElems = (!state.cli.result.failed &&
    state.cli.result.expr && state.cli.result.expr.value
  ) ? preview(state.cli.result.expr.value) : null
  return previewElems ? h(`div`, [ //see app.js for the usage of the css... it is a bit weird to do this so... you know... fix it?
      h('style', previewElems.css),
      previewElems.dom
    ]) : h(`span`)
}

module.exports = (cli) => {
  return {
    state: state(cli),
    render
  }
}
