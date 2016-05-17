//const ast = require('./ast')
const grammar = require('./grammar2')

const parser = () => {
  return {
    parse: (input) => {
      return grammar.parse(input)
    }
  }
}


module.exports = parser
