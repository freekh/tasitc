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
  return previewElems ? h(`div.Tasitc-Cli-Preview`, [
      h('style', previewElems.css),
      previewElems.dom
    ]) : h(`div.Tasitc-Cli-Preview`)
}

module.exports = (cli) => {
  return {
    state: state(cli),
    render
  }
}
