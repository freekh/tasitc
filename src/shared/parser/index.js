const env = require('../env')
const request = require('request-promise')

const builtIns = {
  'listen': (path) => {
    return request.get(env.server + '/cmd/listen', {
      qs: { path }
    })
  },
  'eval': (data) => {
    return request.get(env.server + '/cmd/eval', {
      qs: { data }
    })
  },
  'request': (path) => {
    console.log('request from ', path)
  }
}

const parser = () => {
  const parser = require('./grammar')(builtIns)

  return {
    parse: (input, dir) => {
      return parser.parse(input)
    }
  }
}


module.exports = parser
