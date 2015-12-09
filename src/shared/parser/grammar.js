const P = require('parsimmon')

module.exports = (cmds) => {
  return {
    parse: (input) => {
      const exprs =  input.split('|').map(expr => {
        const parts = expr.split(' ').map(p => p.trim())
         parts.split('>')
        const cmd = cmds[parts[0]]
        return {
          success: (cmd && true) || false,
          cmd,
          args: parts.slice(1)
        }
      })
      return exprs
    }
  }
}
