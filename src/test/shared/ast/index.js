'use strict'

const {ast, parse, error} = require('../../../main/shared/parser/grammar2')

module.exports = {
  'basic ast test': (test) => {
    const services = {
      '/google/drive': (id, args, context) => {
        console.log(args)
        return Promise.resolve({
          'csv-url': 'https://...'
        })
      },
      'gsheet2json': (id, args, context) => {
        return Promise.resolve({
          columns: [
            {
              num: 0,
              rows: [
                'hello',
                'world'
              ]
            }
          ]
        })
      },
      'html': (id, args, context) => {
        const dom = args && args[0] && (args[0] instanceof Array && args[0].join('') || args[0]) || context || ''
        const style = args[1] ? '<header><style>'+args[1]+'</style></header>' : ''
        return Promise.resolve('<html>'+style+'<body>'+dom+'</body></html>')
      },
      'li': (id, args, context) => {
        const dom = args && args[0] && (args[0] instanceof Array && args[0].join('') || args[0]) || context || ''
        return Promise.resolve(
          '<li>' + dom + '</li>'
        )
      },
      'ul': (id, args, context) => {
        const dom = args && args[0] && (args[0] instanceof Array && args[0].join('') || args[0]) || context || ''
        return Promise.resolve(
          '<ul>' + dom + '</ul>'
        )
      },
      'account': (id, args, context) => {
        const testReject = false
        if (testReject) {
          return Promise.reject({
            msg: 'Could not authenticate',
            args,
            id
          })
        } else {
          return Promise.resolve({
            user: 'freekh'
          })
        }
      },
      '/bootstrap/css': (id, args, context) => {
        return Promise.resolve('li { color: red; }')
      },
      'str': (id, args, context) => {
        return Promise.resolve(args.join(''))
      }
    }

    const transpile = (node) => { //TODO: dont do this... use Function instead!
      const commons = {
        args: (args) => '['+args.map(arg => {
          return `${transpile(arg)}`
        }).join(', ')+']'
      }

      if (node instanceof ast.Comprehension) {
        return transpile(node.expression) + node.targets.map((n, i) => {
          let comprehension = 'map'
          if (i === 0 && node.expression instanceof ast.Call ||
              i > 0 && node.targets[i - 1] instanceof ast.Call) {
            comprehension = 'then'
          }
          return `.${comprehension}(function($) { return ${transpile(n)}})`
        }).join('')
      } else if (node instanceof ast.Call) {
        //if not alias and is atom, use atom directly
        return `call('${node.id.value}', ${commons.args(node.args)}, $)`
      } else if (node instanceof ast.Id) {
        return `callOrString('${node.value}', [], $)`
      } else if (node instanceof ast.Str) {
        return `'${node.value}'`
      } else if (node instanceof ast.Parameter) {
        return `parameter('${node.id}')`
      } else if (node instanceof ast.Sink) {
        return `sink(${transpile(node.expression)}, '${node.path.value}')`
      } else if (node instanceof ast.Keyword) {
        return `{'${node.id}': ${transpile(node.value)}}`
      } else if (node instanceof ast.Context) {
        return `$`+node.path.map(pathElem => {
          if (pathElem instanceof ast.Subscript) {
            return '['+pathElem.index.value+']'
          } else if (pathElem instanceof ast.Attribute) {
            return '.'+pathElem.attr.value
          } else {
            throw new Error(`Unknown AST path element: ${JSON.stringify(pathElem)}`)
          }
        }).join('')
      } else {
        throw new Error(`Unknown AST node : ${JSON.stringify(node)}}`)
      }
    }


    const sink = (expression, id) => {
      console.log('sink', id)
      return Promise.resolve(expression)
    }

    const parameter = (id) => {
      return Promise.resolve('Test')
    }


    const exec = (id, args, context) => {
      const service = services[id]
      const argsPromises = args && args.map(a => {
        if (a instanceof Array) {
          return Promise.all(a)
        } else if (a instanceof Promise) {
          return a
        } else if (a instanceof Object) {
          const id = Object.keys(a)[0] //FIXME: this is a keyword so this might be right? still smells bad
          return a[id].then(value => {
            let ret = {}
            ret[id] = value
            return ret
          })
        } else {
          return Promise.resolve(a)
        }
      }) || []
      return Promise.all(argsPromises).then(args => {
        return service(id, args, context)
      })
    }

    const callOrString = (id, args, context) => {
      if (services[id]) {
        return exec(id, args, context)
      } else {
        return Promise.resolve(id)
      }
    }

    const call = (id, args, context) => {
      const service = services[id]
      if (service) {
        //TODO: hmm... this flattening is pret-ty ugly!
        //FIXME: keywords and args WILL break unless it only flattens things that are supposed to be flattened (Promises)
        return exec(id, args, context)
      } else {
        return Promise.reject({msg: `Unknown service: '${id}'`, id, args, code: 0})
      }
    }

    const $ = {}
    //const ast1 = parse(`/google/drive --path=(str ?path '.gsheet') --acount=(account ~/google/freekh) | gsheet2json | html (ul ($.columns[0].rows | li)) /bootstrap/css > ~/test/rows`).value
    const input = `/google/drive --path=(str ?path '.gsheet') --acount=(account ~/google/freekh) | gsheet2json | html (ul ($.columns[0].rows | li)) /bootstrap/css > ~/test/rows`
    const expected = '<html><header><style>li { color: red; }</style></header><body><ul><li>hello</li><li>world</li></ul></body></html>'
    const parsed = parse(input)
    if (parsed.status) {
      const ast1 = parsed.value
      const transpiled = transpile(ast1)
      console.log(transpiled)

      eval(transpiled).then(res => {
        test.equal(res, expected)
      }).catch(err => {
        test.ok(false, err)
        if (err.stack) {
          console.error('Fatal error', err)
          console.error(err.stack)
        } else if (err.msg !== undefined) {
          console.error(`ERROR (id: '${err.id}'): ${err.msg}`)
        } else {
          console.error('Fatal unknown error', err)
        }
      })
    } else {
      test.ok(false, error(input, parsed).join('\n'))
    }
    test.ok(parsed.status, 'Could not parse')
    test.done()
  }
}
