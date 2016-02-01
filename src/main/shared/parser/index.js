const ast = require('./ast')

const parser = () => {
  return {
    parse: (input) => {
      return ast.parse(input)
    }
  }
}


module.exports = parser
