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
const Json = require('./json')

//Upgrade instead of using these methods
P.sepBy1 = (parser, separator) => {
  var pairs = separator.then(parser).many();

  return parser.chain(function(r) {
    return pairs.map(function(rs) {
      return [r].concat(rs);
    })
  })
}

P.sepBy = (parser, separator) => {
  return P.sepBy1(parser, separator).or(P.of([]));
}
//

const regex = P.regex
const optWhitespace = P.optWhitespace
const lazy = P.lazy
const alt = P.alt

const lparen = P.string('(')
const rparen = P.string(')')
const comment = P.string('#').then(P.takeWhile(l => {
  return l !== '\n'
})).skip(P.string('\n'))


const id = regex(/[\/~\.a-zA-Z_\$\-][\/~\.\$a-zA-Z0-9_\-@]*/).map(value => {
  return {
    type: 'id',
    value
  }
}).desc('id')


const singleQuotedStr = regex(/\'(?:[^\'\\]|\\.)*\'/) //why: |\\.????
  .map(value => {
    //slice of last quote
    return value.slice(1, -1)
  })
  .map(value => {
    return {
      type: 'string',
      value
    }
}).desc('unquoted string')
const doubleQuotedStr = regex(/"(?:[^"\\]|\\.)*"/)
  .map(value => {
    //slice of last quote
    return value.slice(1, -1)
  })
  .map(value => {
    return {
      type: 'string',
      value
    }
}).desc('double quote')
const tripleQuotedStr = P.string('"""').then(P.regex(/(?:[^"""\\]|\\.)*/)).skip(P.string('"""'))
  .map(value => {
    //slice of last quote
    return value.slice(1, -1)
  })
  .map(value => {
    return {
      type: 'string',
      value
    }
}).desc('double quote')
const unquotedString = id
  .map(value => {
    return {
      type: 'string',
      value
    }
}).desc('quote')
const string = P.alt(
  tripleQuotedStr,
  singleQuotedStr,
  doubleQuotedStr,
  unquotedString
)


const requireParam = P.string('?.').then(id).map(value => {
  return {
    type: 'required-param',
    value
  }
})

let json;
let expr;
let form;
let params;

const list = lazy('list', () => {
  return P.string('[').then(P.optWhitespace).then(P.sepBy1(expr, P.whitespace)).skip(P.optWhitespace).skip(P.string(']'))
}).map(value => {
  return {
    type: 'list',
    value
  }
})

form = lazy('form', () => {
  //const sexpr = P.alt(P.seq(id, P.whitespace, params), P.seq(id))
  // const sexpr = P.seq(id, params)
  return lparen.then(P.optWhitespace).then(expr).skip(P.optWhitespace).skip(rparen)
}).map(value => {
  return value
})

let namedParam = lazy('named-param', () =>
  P.string('--').then(P.seq(regex(/[a-zA-Z_][a-zA-Z0-9_-]*/), P.string('='), expr))
).map(value => {
  return {
    type: 'named-param',
    name: value[0],
    value: value[2]
  }
})

let param = lazy('param', () => P.alt(
  namedParam,
  id,
  string,
  json,
  list,
  form,
  requireParam
))

params = lazy('params', () => {
  return P.alt(P.sepBy1(param, P.whitespace), P.seq(param))
})

json = lazy('json', () => {
  return Json(expr).map(value => {
    return {
      type: 'json',
      value
    }
  })
})

expr = lazy('expr', () => {
  // return form
  const expr =  P.alt(
    P.seq(id, P.whitespace, params).map(values => {
      return { head: values[0], tail: values[2] }
    }),
    form.map(value => {
      return value[0].symbols
    }),
    list,
    json,
    id,
    string,
    requireParam
  )
  //TODO: look at ; again maybe we should remove it?
  return P.sepBy(
    P.alt(
      P.sepBy1(
        expr,
        P.optWhitespace.then(P.string('|')).skip(P.optWhitespace)
      ).map(values => {
        if (values[1]) {
          return {
            type: 'pipe',
            src: values[0],
            dest: {
              type: 'expr',
              value: values[1]
            }
          }
        } else {
          return {
            type: 'expr',
            symbols: values[0]
          }
        }

      }),
      P.seq(expr, P.optWhitespace).map(values => {
        return {
          type: 'expr',
          symbols: values[0]
        }
      })
    ),
    P.string(';').skip(P.optWhitespace)
  )
})
const command = P.optWhitespace.then(comment.many()).then(P.optWhitespace).then(P.alt(
  expr.skip(P.optWhitespace).skip(P.string('>')).chain(src => {
    return P.optWhitespace.then(expr).map(dest => {
     return {
       type: 'named-pipe',
       src,
       dest: {
         type: 'expr',
         value: dest
       }
     }
   })
 }),
 expr.map(value => {
   return value
 })
))

module.exports = {
  parse: (input) => {
    const result = command.parse(input.trim()) //HACK: NOTICE trim() here

    return result
  }
}
