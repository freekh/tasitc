
const builtIns = {
  'listen': (path) => {

  },
  'request': (path) => {

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
