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

const id = lexeme(regex(/[a-zA-Z_][a-zA-z0-9_]*/))
const exprEnd = P.string('\\n', '\n').or(P.eof)
const params = lparen

const p1 = id.map(v => {
  return { value: v, type: 'command' }
}).skip(P.eof)

const p2 = id.map(v => {
  return { value: v, type: 'command' }
}).skip(lparen).then(
  id.skip(string('\'')).then(regex(/.[^\']*/)).skip(string('\'')).skip(rparen)
)

const expr = lazy('expr', () => ignore.then(
  alt(
    p1, p2


  )
))
const command = ignore.then(expr.many())

module.exports = {
  parse: (input) => {
    // const lparen = string('(')
    // const rparen = string(')')
    //
    // const expr = lazy('expression', () => {
    //   return form.or(atom)
    // })
    //
    // const number = lexeme(regex(/[0-9]+/)).map(parseInt)
    // const id = lexeme(regex(/[a-z_]\w*/i))
    //
    // const atom = number.or(id)
    //
    // const form = lparen.then(expr.many()).skip(lparen)
    // return alt(expr, ).parse(input)
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
