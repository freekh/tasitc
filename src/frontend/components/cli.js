const hg = require('mercury')
const h = hg.h

const parser = require('../../shared/parser')()

const CssClass = 'tsitc-cli'

const InputName = 'cli-text'

const ENTER = 13

let cli = () => {
  return hg.state({
    failed: hg.value(false),
    current: hg.value(null),
    result: hg.value(null),
    channels: {
      parse: (state, data) => {
        const input = data[InputName]
        const astLike = parser.parse(input)
        const failed = astLike.find(node => !node.success)
        if (!failed) {
          const expr = astLike[0] //TODO: use all expressions of course...
          state.current.set(expr)
          state.failed.set(false)
        } else {
          state.failed.set(true)
        }
      },
      keyup: (state, key) => {
        const s = state()
        if (!s.failed) {
          const expr = s.current
          expr.cmd(expr.args).then((result) => {
            console.log(result)
            state.result.set(result)
          })
        }
      }
    }
  })
}

cli.render = (state) => {
  const inputClass = (state.failed ? `.${CssClass}-failed` : '')
  return h(`div.${CssClass}`, [
    state.result ? h('div', String(state.result)): h('span'),
    h('input' + inputClass, {
      type: 'text',
      name: InputName,
      'ev-keyup': hg.sendKey(state.channels.keyup, null, {key: ENTER}),
      'ev-input': hg.sendChange(state.channels.parse)
    })
  ])
}

module.exports = cli
