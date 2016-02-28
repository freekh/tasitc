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

const vector = P.lazy('vector', () => {
  return P.string('[').then(form.chain(head => {
    const tail = P.whitespace.then(form).many()
    return tail.map(t => {
      return [head].concat(t)
    })
  })).skip(P.string(']'))
})

const piper = (f) => {

}

form = P.lazy('form', () => {
  const singleForm = P.alt(
    list,
    vector,
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
  return P.alt(
    singleForm.chain(f => {
      const pipesP = P.whitespace.skip(P.string('|')).skip(P.whitespace).then(form).skip(P.optWhitespace)
      return pipesP.map(pipe => {
        // if (f.map) {
        //   return f.map(e => {
        //     console.log('e', e, pipes)
        //     return pipes.reverse().map(pipe => {
        //       console.log(pipe)
        //       return {
        //         path: pipe.path,
        //         args: pipe.args.concat(e)
        //       }
        //     })
        //   })
        // } else
        const isArray = f.constructor === Array
        //console.log(isArray|| false, f, pipe)
        if (isArray) {
          let parent = null
          if (pipe.piped) {
            parent = pipe.args[pipe.args.length - 1]
          }
          return f.map(e => {
            if (parent) {
              return {
                path: pipe.path,
                args: pipe.args.slice(0, -1).concat({
                  path: parent.path,
                  args: parent.args.concat(e),
                  piped: true
                }),
                piped: true
              }
            }
            // if (pipe.pipe) {
            //   const p = pipe.args[pipe.args.length - 1]
            //   console.log(pipe, p)
            //   return {
            //     path: pipe.path,
            //     args: pipe.args.slice(-1).concat(p.args.concat(e)),
            //     pipe: true
            //   }
            // }
            return {
              path: pipe.path,
              args: pipe.args.concat(e),
              piped: true
            }
          })
        }

        return {
          path: pipe.path,
          args: pipe.args.concat(f),
          piped: true
        }
      })
    }),
    singleForm
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
