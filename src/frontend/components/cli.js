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
        const astLike = parser.parse(input)
        const failed = astLike.find(node => !node.success)
        if (!failed) {
          astLike.forEach(expr => {
            expr.cmd(expr.args)
          })
        } else {
          console.log('failed at', failed)
        }
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
