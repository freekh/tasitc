const hg = require('mercury')
const h = hg.h
const request = require('request-promise')

const sharedRoutes = require('../../shared/routes')
const env = require('../../shared/env')

const parser = require('../../shared/parser')()
const preview = require('../../shared/preview')

//
const InputName = 'cli-text'

const ENTER = 13

const state = hg.state({
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
      console.log(expr)
      if (expr.status && expr.value && expr.value.save) {
        request({
          method: 'POST',
          uri: env.server +sharedRoutes.save,
          body: expr,
          json: true
        }).then(res => {
          console.log(res)
        }).catch(err => {
          console.error(err)
        })
      }
    }
  }
})


const render = (state) => {
  const inputClass = (state.result.failed ? `.Tasitc-Cli-Failed` : '')
  return h(`div.Tasitc-Cli`, [
    state.failed ?
      h(`div.Tasitc-Cli-Failed`, JSON.stringify(state.result)) :
      h(`div.Tasitc-Cli-Result`, JSON.stringify(state.result)),
    h(`input.Tasitc-Cli-Input` + inputClass, {
      name: InputName,
      'ev-keyup': hg.sendKey(state.channels.keyup, state.result.expr, {key: ENTER}),
      'ev-input': hg.sendChange(state.channels.parse)
    })
  ])
}

module.exports = () => {
  return {
    state,
    render
  }
}
