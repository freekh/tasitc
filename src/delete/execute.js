const hg = require('mercury') //HACK: remove!
const h = hg.h

//hackery
const fs = require('./fs')

const execute = (global) => { //UGLY hack!
  const value = global.value.trim()
  const valueSplit = value.split(' ')
  const cmd = valueSplit.length > 0 && valueSplit[0]
  const args = valueSplit.slice(1).map(arg => arg.trim())
  const cwd = global.cwd
  console.log('execute', cwd, cmd, args)
  if (cmd === 'ls') {
    return fs.readTree(cwd).then(objects => {
      return objects.map(object => {
        return hg.create(h('div.output-line', h('span', object.filename + (object.dir ? '/' : ''))))
      })
    })
  } else if (cmd === 'help') {
    return Promise.resolve([
      hg.create(h('div', 'This is just a hack so only ls works...'))
    ])
  } else if (cmd === 'cd') {
    let nextCwd = cwd + '/' +args[0]
    if (args[0] === '..') {
      nextCwd = cwd.split('/').slice(0, -1).join('/')
    }

    window.history.pushState(null, null, window.location.pathname + '?cwd='+nextCwd)
    global.cwd = nextCwd
    return Promise.resolve([
        hg.create(h('div', ''))
    ])
  } else if (value) {
    return Promise.resolve([
      hg.create(h('div', 'Unknown command: ' + value))
    ])
  }
}

module.exports = execute
