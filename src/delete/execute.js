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
  if (cmd === 'ls') {
    let hack = null
    if (cwd === 'freekh/tasitc-test') {
      hack = [ //TODO:
        {filename: 'README.md', dir: false},
        {filename: 'dir', dir: true},
        {filename: 'file2.txt', dir: false}
      ]
    } else if (cwd === 'freekh/tasitc-test/dir') {
      hack = [
        {filename: 'file2.txt', dir: false}
      ]
    }
    const tree = Promise.resolve(hack) //fs.readTree(cwd) offline hack
    return tree.then(objects => {
      return objects.map(object => {
        return hg.create(h('div.output-line', [
          h('span', [
            object.dir ? h('span.icon', h('i.fa.fa-caret-right')) : null,
            object.dir ? h('span.icon', h('i.fa.fa-folder')) : null,
            !object.dir ? h('span.icon.padded', h('i.fa.fa-file')) : null,
            h('span.filename', object.filename)
          ])
        ]))
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
