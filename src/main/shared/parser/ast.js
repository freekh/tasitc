'use strict'

const P = require('parsimmon')

const regex = P.regex
const string = P.string
const optWhitespace = P.optWhitespace
const lazy = P.lazy
const alt = P.alt

const lparen = string('(')
const rparen = string(')')
const comment = P.string('#').then(P.takeWhile(l => {
  return l !== '\n'
}))

const ignore = P.whitespace.or(comment.many())
const lexeme = p => p.skip(optWhitespace)

const id = lexeme(regex(/[a-zA-Z_][a-zA-z0-9_]*/)).map(value => {
  return {
    type: "id",
    value
  }
})
const str = string('\'').then(regex(/.[^\']*/)).skip(string('\'')).map(value => {
  return {
    type: 'string',
    value
  }
})


let expr;
let form = lazy('form', () => lparen.then(P.seq(id, expr.many())).skip(rparen))
expr = lazy('expression', () => {
  return ignore.then(alt(
    str, form, alt(
      id.skip(string('\n').or(P.eof)),
      P.seq(id.skip(lparen).skip(string('\n')), ignore.then(P.seq(id, expr.many()))).skip(rparen),
      P.seq(id, form)
    )
  )).skip(P.optWhitespace)
})
const command = ignore.then(expr.many())

module.exports = {
  parse: (input) => {
    console.log(input)

    const result = command.parse(input)
    if (result.status === false) {
      let indents = ''
      let column = 0
      let line = 1
      for (let i = 0; i < result.index; i++) {
        if (input[i] === '\n') {
          indents = ''
          column = 0
          line += 1
        } else {
          indents += '~'
          column += 1
        }
      }
      console.log('\x1b[91m', '\nFAILURE: line: ' + line + ', column: ' + column+ '\n','\x1b[0m')
      console.log(' ' + input.split('\n').slice(line - 3 > 0 ? line - 3 : 0, line).join('\n '))
      console.log('\x1b[91m', indents + '^','\x1b[0m')
      console.log(' ' + input.split('\n').slice(line, line + 3 <= input.length ? line + 3 : input.length).join('\n '))
      console.log('\x1b[91m', `Got: '${input[result.index] ? input[result.index].replace('\n', '\\n'): 'EOF'}'. Expected: ${result.expected.join(' or ')}\n`,'\x1b[0m')
    }
    return result
  }
}
