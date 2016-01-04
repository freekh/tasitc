
const builtIns = {
  'listen': (path) => {
    console.log('listen on ', path)
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
