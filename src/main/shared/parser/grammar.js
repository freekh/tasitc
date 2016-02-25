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

//hoist lazy
var list
var expr
var form

//a form is either a list of forms, an expr or an atom.
//an expr is started with a non-whitespace character and ended by a \n. it is the same as a list
//a list is defined by ( and )
//an atom is either numbers, strings, paths, json, arrays or symbols?


list = P.lazy('list', () => {
  return P.string('(').then(form).skip(P.string(')'))
})
expr = P.lazy('expr', () => {
  return P.optWhitespace.then(form).skip(P.string('\n'))
})

form = P.lazy('form', () => {
  return P.optWhitespace.then(
    P.alt(
      list,
      expr
    )
  ).skip(P.optWhitespace)
})

module.exports = {
  parse: (input) => {
    const result = form.parse(input)

    return result
  }
}
