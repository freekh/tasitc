const hg = require('mercury')
const h = hg.h

const parser = require('../../shared/parser')()

const InputName = 'cli-text'

const ENTER = 13

//TODO: ▼ move
const preview = (expr) => {
  const argAsJs = (arg) => {
    if (arg && arg.atom === 'string') {
      return arg.value
    } else if (arg && arg.path) {
      const children = arg.args ? arg.args.map(argAsJs) : null
      if (typeof children[0] === 'string' && children.length > 1) {
        return h.apply(null, [arg.path + children[0], children.slice(1)])
      } else {
        return h.apply(null, [arg.path, children])
      }
    }
    return null
  }
  const valueAsJs = (value) => {
    if (value.path === 'html') {
      if (value.args[1] && !value.args[1].atom) {
        console.error(value)
        throw Error('Unexpected css value???')
      }
      return h(`div.Tasitc-Cli-Preview-Html`, [
        value.args[1] && value.args[1].atom === 'string' ? h('style', value.args[1].value) : null,
        argAsJs(value.args[0])
      ])
    }
    return null
  }
  if (!expr.status) {
    return null
  }
  return valueAsJs(expr.value)
}
//TODO: ▲ move

let cli = () => {
  return hg.state({
    result: hg.struct({
      expr: hg.value(null),
      failed: hg.value(false)
    }),
    channels: {
      parse: (state, data) => {
        const input = data[InputName]
        const expr = parser.parse(input)
        const failed = !expr.status
        state.result.set({
          expr,
          failed
        })
      },
      keyup: (_, expr) => {
        console.log('execute', expr)
      }
    }
  })
}

cli.render = (state) => {
  const inputClass = (state.result.failed ? `.Tasitc-Cli-Failed` : '')
  return h(`div.Tasitc-Cli`, [
    state.failed ?
      h(`div.Tasitc-Cli-Failed`, JSON.stringify(state.result)) :
      h(`div.Tasitc-Cli-Result`, JSON.stringify(state.result)),
    h(`input.Tasitc-Cli-Input` + inputClass, {
      name: InputName,
      'ev-keyup': hg.sendKey(state.channels.keyup, state.result.expr, {key: ENTER}),
      'ev-input': hg.sendChange(state.channels.parse)
    }),
    state.result && state.result.expr ? preview(state.result.expr) : null,
  ])
}

module.exports = cli
