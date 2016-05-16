'use strict'

class Expression { //TODO: rename to Comprehension(generator, targets)
  constructor(base, comprehensions = []) {
    this.base = base
    this.comprehensions = comprehensions
  }
}

class Call {
  constructor(id, args = [], keywords = {}) {
    this.id = id
    this.args = args
    this.keywords = keywords
  }
}

class Attribute { //foo.column
  constructor(value, attr) {
    this.value = value
    this.attr = attr
  }
}

class Context { //$
  constructor() {
    this.id = '$'
  }
}

class Subscript { //[1][0]
  constructor(value, index) {
    this.value = value
    this.index = index
  }
}

class Id {
  constructor(value) {
    this.value = value
  }
}

class Html { //TODO: extends Call?
  constructor(args = [], keywords = {}) {
    this.id = 'html'
    this.args = args
    this.keywords = keywords
  }
}

class Str { //TODO: rename?
  constructor(value) {
    this.value = value
  }
}

class Num { //TODO: rename?
  constructor(value) {
    this.value = value
  }
}


module.exports = {
  'basic ast test': (test) => {
    const astEx = new Expression(
      new Call(
        new Id('google/drive/Test.gsheet'),
        [],
        {
          account: [
            new Call(
              new Id('account'),
              [],
              {
                l: [
                  new Str('freekh')
                ]
              }
            )
          ]
        }),
      [
        new Call(
          new Id('gsheet2json')
        ),
        new Call(
          new Id('html'),
          [
            new Expression(
              new Attribute(
                new Subscript(
                  new Attribute(
                    new Context(),
                    'columns'
                  ),
                  new Num(
                    0
                  )
                ),
                'rows'
            ),
              [
              new Call(
                new Id('li'),
                [],
                {})
              ]
            )
          ]
        )
      ]
    )
    
    console.log(`google/drive/Test.gsheet --acount=(account -l 'freekh') | gsheet2json | html ($.columns[0].rows | li)`)
    console.log(JSON.stringify(astEx, null, 2))

    const transpile = (node) => {
      const commons = {
        args: (args) => '['+args.map(arg => {
          return `${transpile(arg)}`
        }).join(',')+']',
        keywords: (keywords) => '{'+Object.keys(keywords).map(id => {
          return `'${id}':[${keywords[id].map(transpile).join(',')}]`
        }).join(',')+'}'
      }
      if (node instanceof Expression) {
        return transpile(node.base) + node.comprehensions.map((n, i) => {
          let comprehension = 'map'
          if (i === 0 && node.base instanceof Call ||
              i > 0 && node.comprehensions[i - 1] instanceof Call) {
            comprehension = 'then'
          }
          return `.${comprehension}(function($) { return ${transpile(n)}})`
        }).join('')
      } else if (node instanceof Call) {
        return `call(${transpile(node.id)}, ${commons.args(node.args)}, ${commons.keywords(node.keywords)}, $)`
      } else if (node instanceof Id) {
        return `'${node.value}'`
      } else if (node instanceof Str) {
        return `'${node.value}'`
      } else if (node instanceof Subscript) {
        return `${transpile(node.value)}[${node.index.value}]`
      } else if (node instanceof Attribute) {
        return `${transpile(node.value)}.${node.attr}`
      } else if (node instanceof Context) {
        return `$`
      } else {
        return '!!'+node+'!!'
      }
    }

    console.log(transpile(astEx))

    const services = {
      'google/drive/Test.gsheet': (id, args, keywords, context) => {
        if (keywords.account && keywords.account[0] && keywords.account[0].authenticated) {
          return Promise.resolve({
            'csv-url': 'https://...'
          })
        } else {
          return Promise.reject({error: 'Could not authenticate'})
        }
      },
      'gsheet2json': (id, args, keywords, context) => {
        return Promise.resolve({
          columns: [
            {
              rows: [
                'hello',
                'world'
              ]
            }
          ]
        })
      },
      'html': (id, args, keywords, context) => {
        const dom = args && args[0] && args[0].join('') || context || []
        return Promise.resolve('<html>'+dom+'</html>')
      },
      'li': (id, args, keywords, context) => {
        const dom = args && args[0] && args[0].join('') || context || ''
        return Promise.resolve(
          '<li>' + dom + '</li>'
        )
      },
      'account': (id, args, keywords, context) => {
        return Promise.resolve({
          authenticated: true
        })
      }
    }

    const call = (id, args, keywords, context) => {
      const service = services[id]
      if (service) {
        const keywordPromises = []
        Object.keys(keywords).forEach(id => {
          keywordPromises.push(Promise.all(keywords[id]).then(values => {
            return {
              id,
              values
            }
          }))
        })
        const argsPromises = args.map(a => Promise.all(a))
        return Promise.all([Promise.all(argsPromises), Promise.all(keywordPromises)]).then(([args, keywordsArray]) => {
          const keywords = {}
          keywordsArray.forEach(({id, values}) => keywords[id] = values)
          return service(id, args, keywords, context)
        })
      } else {
        return Promise.reject({msg: `Unknown service: '${id}'`, id, code: 0})
      }
    }

    const $ = {}
    const t = call('google/drive/Test.gsheet', [],
                   {'account':[
                     call('account', [], {'l':['freekh']}, $)]}, $)
            .then(function($) {
              return call('gsheet2json', [], {}, $)
            })
            .then(function($) {
              return call('html', [
                $.columns[0].rows.map(function($) {
                  return call('li', [], {}, $)
                })], {}, $)
            })
    t.then(a => {
      console.log('!--->', a)
    }).catch(err => {
      if (err.stack) {
        console.error('Fatal error', err)
        console.error(err.stack)
      } else if (err.code !== undefined) {
        console.error(`ERROR (code: ${err.code}): ${err.msg}`)
      } else {
        console.error('Unknown error', err)
      }
    })
    // eval(transpile(astEx)).then(console.log).catch(err => {
    //   console.error(err)
    // })
    
// >>> print(astunparse.dump(ast.parse("[i.to_bytes(1, 'big') for i in range(10)]", mode='eval')))
// Expression(body=ListComp(
//   elt=Call(
//     func=Attribute(
//       value=Name(
//         id='i',
//         ctx=Load()),
//       attr='to_bytes',
//       ctx=Load()),
//     args=[
//       Num(n=1),
//       Str(s='big')],
//     keywords=[]),
//   generators=[comprehension(
//     target=Name(
//       id='i',
//       ctx=Store()),
//     iter=Call(
//       func=Name(
//         id='range',
//         ctx=Load()),
//       args=[Num(n=10)],
//       keywords=[]),
//     ifs=[])]))

// >>> print(astunparse.dump(ast.parse('[i**2 for i in range(10)]', mode='eval')))
// Expression(body=ListComp(
//   elt=BinOp(
//     left=Name(
//       id='i',
//       ctx=Load()),
//     op=Pow(),
//     right=Num(n=2)),
//   generators=[comprehension(
//     target=Name(
//       id='i',
//       ctx=Store()),
//     iter=Call(
//       func=Name(
//         id='range',
//         ctx=Load()),
//       args=[Num(n=10)],
//       keywords=[]),
//     ifs=[])]))

// >>> print(astunparse.dump(ast.parse('[i*j for i in range(2) for j in range(3,5)]', mode='eval')))
// Expression(body=ListComp(
//   elt=BinOp(
//     left=Name(
//       id='i',
//       ctx=Load()),
//     op=Mult(),
//     right=Name(
//       id='j',
//       ctx=Load())),
//   generators=[
//     comprehension(
//       target=Name(
//         id='i',
//         ctx=Store()),
//       iter=Call(
//         func=Name(
//           id='range',
//           ctx=Load()),
//         args=[Num(n=2)],
//         keywords=[]),
//       ifs=[]),
//     comprehension(
//       target=Name(
//         id='j',
//         ctx=Store()),
//       iter=Call(
//         func=Name(
//           id='range',
//           ctx=Load()),
//         args=[
//           Num(n=3),
//           Num(n=5)],
//         keywords=[]),
//       ifs=[])]))

// >>> print(astunparse.dump(ast.parse('[mult(i,j) for i in range(2) for j in range(3,5)]', mode='eval')))
// Expression(body=ListComp(
//   elt=Call(
//     func=Name(
//       id='mult',
//       ctx=Load()),
//     args=[
//       Name(
//         id='i',
//         ctx=Load()),
//       Name(
//         id='j',
//         ctx=Load())],
//     keywords=[]),
//   generators=[
//     comprehension(
//       target=Name(
//         id='i',
//         ctx=Store()),
//       iter=Call(
//         func=Name(
//           id='range',
//           ctx=Load()),
//         args=[Num(n=2)],
//         keywords=[]),
//       ifs=[]),
//     comprehension(
//       target=Name(
//         id='j',
//         ctx=Store()),
//       iter=Call(
//         func=Name(
//           id='range',
//           ctx=Load()),
//         args=[
//           Num(n=3),
//           Num(n=5)],
//         keywords=[]),
//       ifs=[])]))

// >>> print(astunparse.dump(ast.parse('mult(a = 1, b = 2)', mode='eval')))Expression(body=Call(
//   func=Name(
//     id='mult',
//     ctx=Load()),
//   args=[],
//   keywords=[
//     keyword(
//       arg='a',
//       value=Num(n=1)),
//     keyword(
//       arg='b',
//       value=Num(n=2))]))

// >>> print(astunparse.dump(ast.parse('[mult(i,j) for i in range(2) for j in range(3,5) if j > 1]', mode='eval')))
// Expression(body=ListComp(
//   elt=Call(
//     func=Name(
//       id='mult',
//       ctx=Load()),
//     args=[
//       Name(
//         id='i',
//         ctx=Load()),
//       Name(
//         id='j',
//         ctx=Load())],
//     keywords=[]),
//   generators=[
//     comprehension(
//       target=Name(
//         id='i',
//         ctx=Store()),
//       iter=Call(
//         func=Name(
//           id='range',
//           ctx=Load()),
//         args=[Num(n=2)],
//         keywords=[]),
//       ifs=[]),
//     comprehension(
//       target=Name(
//         id='j',
//         ctx=Store()),
//       iter=Call(
//         func=Name(
//           id='range',
//           ctx=Load()),
//         args=[
//           Num(n=3),
//           Num(n=5)],
//         keywords=[]),
//       ifs=[Compare(
//         left=Name(
//           id='j',
//           ctx=Load()),
//         ops=[Gt()],
//         comparators=[Num(n=1)])])]))



// >>> print(astunparse.dump(ast.parse('lambda x: x + 1', mode='eval')))
// Expression(body=Lambda(
//   args=arguments(
//     args=[arg(
//       arg='x',
//       annotation=None)],
//     vararg=None,
//     kwonlyargs=[],
//     kw_defaults=[],
//     kwarg=None,
//     defaults=[]),
//   body=BinOp(
//     left=Name(
//       id='x',
//       ctx=Load()),
//     op=Add(),
//     right=Num(n=1))))

// >>> print(astunparse.dump(ast.parse('g = lambda x: x + 1')))
// Module(body=[Assign(
//   targets=[Name(
//     id='g',
//     ctx=Store())],
//   value=Lambda(
//     args=arguments(
//       args=[arg(
//         arg='x',
//         annotation=None)],
//       vararg=None,
//       kwonlyargs=[],
//       kw_defaults=[],
//       kwarg=None,
//       defaults=[]),
//     body=BinOp(
//       left=Name(
//         id='x',
//         ctx=Load()),
//       op=Add(),
//       right=Num(n=1))))])

// >>> print(astunparse.dump(ast.parse('def f(a = 0): a + 1')))
// Module(body=[FunctionDef(
//   name='f',
//   args=arguments(
//     args=[arg(
//       arg='a',
//       annotation=None)],
//     vararg=None,
//     kwonlyargs=[],
//     kw_defaults=[],
//     kwarg=None,
//     defaults=[Num(n=0)]),
//   body=[Expr(value=BinOp(
//     left=Name(
//       id='a',
//       ctx=Load()),
//     op=Add(),
//     right=Num(n=1)))],
//   decorator_list=[],
//   returns=None)])

// >> print(astunparse.dump(ast.parse('g = 0')))
// Module(body=[Assign(
//   targets=[Name(
//     id='g',
//     ctx=Store())],
//   value=Num(n=0))])

// >>> print(astunparse.dump(ast.parse('def f(a = 0): g(a); return 0')))
// Module(body=[FunctionDef(
//   name='f',
//   args=arguments(
//     args=[arg(
//       arg='a',
//       annotation=None)],
//     vararg=None,
//     kwonlyargs=[],
//     kw_defaults=[],
//     kwarg=None,
//     defaults=[Num(n=0)]),
//   body=[
//     Expr(value=Call(
//       func=Name(
//         id='g',
//         ctx=Load()),
//       args=[Name(
//         id='a',
//         ctx=Load())],
//       keywords=[])),
//     Return(value=Num(n=0))],
//   decorator_list=[],
//   returns=None)])

//https://www.ibm.com/developerworks/library/l-fuse/
//     struct fuse_operations {
//     int (*getattr) (const char *, struct stat *);
//     int (*readlink) (const char *, char *, size_t);
//     int (*getdir) (const char *, fuse_dirh_t, fuse_dirfil_t);
//     int (*mknod) (const char *, mode_t, dev_t);
//     int (*mkdir) (const char *, mode_t);
//     int (*unlink) (const char *);
//     int (*rmdir) (const char *);
//     int (*symlink) (const char *, const char *);
//     int (*rename) (const char *, const char *);
//     int (*link) (const char *, const char *);
//     int (*chmod) (const char *, mode_t);
//     int (*chown) (const char *, uid_t, gid_t);
//     int (*truncate) (const char *, off_t);
//     int (*utime) (const char *, struct utimbuf *);
//     int (*open) (const char *, struct fuse_file_info *);
//     int (*read) (const char *, char *, size_t, off_t, struct fuse_file_info *);
//     int (*write) (const char *, const char *, size_t, off_t,struct fuse_file_info *);
//     int (*statfs) (const char *, struct statfs *);
//     int (*flush) (const char *, struct fuse_file_info *);
//     int (*release) (const char *, struct fuse_file_info *);
//     int (*fsync) (const char *, int, struct fuse_file_info *);
//     int (*setxattr) (const char *, const char *, const char *, size_t, int);
//     int (*getxattr) (const char *, const char *, char *, size_t);
//     int (*listxattr) (const char *, char *, size_t);
//     int (*removexattr) (const char *, const char *);
// };
    

  }
}
