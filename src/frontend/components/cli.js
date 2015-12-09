const hg = require('mercury')
const h = hg.h

const parser = require('../../shared/parser')()

const CssClass = 'tsitc-cli'

const InputName = 'cli-text'

let cli = () => {
  return hg.state({
    channels: {
      parse: (state, data) => {
        const input = data[InputName]
        console.log(parser.parse(input))
      }
    }
  })
}

cli.render = (state) => {
  return h(`div.${CssClass}`, [
    h('input', {
      type: 'text',
      name: InputName,
      'ev-input': hg.sendChange(state.channels.parse)
    })
  ])
}

module.exports = cli
