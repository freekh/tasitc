const hg = require('mercury') //HACK: remove!
const h = hg.h

//hackery
const fs = require('./fs')

const execute = (cwd, value) => {
  if (value.trim() === 'ls') {
    return fs.readTree(cwd).then(objects => {
      return objects.map(object => {
        return hg.create(h('div.output-line', h('span', object.filename + (object.dir ? '/' : ''))))
      })
    })
  } else if (value.trim() === 'help') {
    return Promise.resolve([
      hg.create(h('div', 'This is just a hack so only ls works...'))
    ])
  } else {
    return Promise.resolve([
      hg.create(h('div', 'Unknown command: ' + value))
    ])
  }
}

module.exports = execute
