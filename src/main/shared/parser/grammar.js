'use strict'


//CAR, CDR, CONS, EQ, ATOM, SET, EVAL, ERROR, QUOTE,
//COND, AND, OR, LIST

//TODO: move out:
const uniq = array => {
    const seen = {};
    const out = [];
    let j = 0;
    for(let i = 0; i < array.length; i++) {
         const item = array[i]
         if(seen[item] !== 1) {
               seen[item] = 1
               out[j++] = item
         }
    }
    return out
}
//

const P = require('parsimmon')

//hoist lazy combinators
var list
var atom
var form

//a form is either a list of forms, an expr or an atom.
//an expr is started with a non-whitespace character and ended by a \n. it is the same as a list
//a list is defined by ( and )
//an atom is either numbers, strings, paths, json, arrays or symbols?


list = P.lazy('list', () => {
  return P.optWhitespace.then(P.string('(')).then(form).skip(P.string(')'))
})

const path = P.regex(/(?!\')[a-z~\.\/]+/).desc('path')
//const path = P.regex(/html|div|str|~\/hello/)
const singleQuotedStr = P.regex(/\'.+?\'/).map(str => {
  return {
    atom: 'string',
    value: str.slice(1, -1)
  }
}).desc('string')

atom = P.lazy('atom', () => {
  return P.alt(
    path,
    singleQuotedStr
  )
})

form = P.lazy('form', () => {
  return P.alt(
      list,
      path.chain(p => {
        const argsP = P.whitespace.then(form).many()
        return argsP.map(args => {
          return {
            path: p,
            args: args
          }
        })
      }),
      atom
    )
})

const expr = form.chain(form => {
  const save = P.optWhitespace.then(
    P.alt(
      P.eof,
      P.seq(P.string('>').skip(P.optWhitespace), path)
    )
  )
  return save.map(save => {
    if (save) {
      return {
        save: save[1],
        value: form
      }
    } else {
      return form
    }
  })
})

module.exports = {
  parse: (input) => {
    const result = expr.parse(input)

    return result
  }
}
