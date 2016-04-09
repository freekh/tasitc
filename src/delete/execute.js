const hg = require('mercury') //HACK: remove!
const h = hg.h

const execute = (value) => {
  if (value.trim() === 'ls') {
    return [
      hg.create(h('div.output-line', [
        h('span', 'mongod.conf'),
        h('span', 'nginx.conf'),
        h('span.exec', 'ngrok.sh '),
        h('span.exec', 'ssh'),
      ])),
      hg.create(h('div.output-line', [
        h('span.dir', 'namecheap'),
        h('span', 'ngrok-viewer.sh'),
        h('span.dir', 'scripts'),
        h('span.dir', 'ssl')
      ]))
    ]
  } else if (value.trim() === 'help') {
    return [
      hg.create(h('div', 'This is just a hack so only ls works...'))
    ]
  } else {
    return [
      hg.create(h('div', 'Unknown command: ' + value))
    ]
  }
}

module.exports = execute
