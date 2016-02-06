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
}).desc('id').mark()


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
}).desc('unquoted string').mark()
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
}).desc('double quote').mark()
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
}).desc('double quote').mark()
const unquotedString = id
  .map(value => {
    return {
      type: 'string',
      value
    }
}).desc('quote').mark()
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
}).mark()

form = lazy('form', () => {
  //const sexpr = P.alt(P.seq(id, P.whitespace, params), P.seq(id))
  // const sexpr = P.seq(id, params)
  return lparen.then(P.optWhitespace).then(expr).skip(P.optWhitespace).skip(rparen)
}).map(value => {
  return {
    type: 'form',
    value
  }
})

let namedParam = lazy('named-param', () =>
  P.string('--').then(P.seq(regex(/[a-zA-Z_][a-zA-Z0-9_-]*/).mark(), P.string('='), expr))
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
}).mark()

json = lazy('json', () => {
  return Json(expr).map(value => {
    return {
      type: 'json',
      value
    }
  })
}).mark()

expr = lazy('expression', () => {
  // return form
  const expr =  P.alt(
    P.seq(id, P.whitespace, params).map(values => {
      return { value: values[0], params: values[2] }
    }),
    form,
    list,
    json,
    string,
    id,
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
            dest: values[1]
          }
        } else {
          return {
            type: 'expr',
            value: values[0]
          }
        }

      }),
      P.seq(expr, P.optWhitespace).map(values => {
        return {
          type: 'expr',
          value: values[0]
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
       dest
     }
   })
 }),
 expr.map(value => {
   return {
     type: 'expr',
     value
   }
 })
))

module.exports = {
  parse: (input) => {
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
      const expected = uniq(result.expected).join(' or ')
      console.log('\x1b[91m', `Got: '${input[result.index] ? input[result.index].replace('\n', '\\n'): 'EOF'}'. Expected: ${expected}\n`,'\x1b[0m')
    }
    return result
  }
}
