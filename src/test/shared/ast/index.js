class Expression {
  constructor(body) {
    this.body = body
  }
}

class Call {
  constructor(func, args = [], keywords = []) {
    this.func = func
    this.args = args
    this.keywords = keywords
  }
}

class Map { //ListComp ???
  constructor(elt, mappers) {

  }
}

class Mapper { //comprehension ???
  constructor(target, iter) {

  }
}

class Attribute {
  constructor(value, attr) {

  }
}

class Name {
  constructor(id) {
    this.id = id
  }
}

class AnonFun { //Check this
  constructor(params, expression) {

  }
}

module.exports = {
  'basic ast test': (test) => {
    //google/drive/Test.gsheet --acount=(account -l freekh) | gsheet2json | html ($.columns[0] | li)
    //call('google/drive/Test.gsheet', { account: call('account', {l: 'freekh'})}).then($ => call('gsheet2json', $).then($ => call('html', $.columns[0].then(call('li')))))



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


    const ast = {
      type: 'Cmd',
      value: 'google/drive/Test.gsheet',
      args: [
        {
          type: 'Obj',
          value: {
            account: {
              type: 'Cmd',
              value: 'account',
              args: [
                {
                  type: 'Obj',
                  value: {
                    l: {
                      type: 'String',
                      value: 'freekh'
                    }
                  }
                }
              ]
            }
          }
        }
      ],
      then: {
        type: 'Cmd',
        value: 'gsheet2json',
        args: [
          { type: 'Res', value: 0 }
        ],
        then: {
          type: 'Cmd',
          value: 'html',
          args: [
            {
              type: 'Res',
              value: {
                type: 'Dot',
                value: {

                }
              }
            }
          ]
        }
      }
    }

    const transpile = (ast) => {
      if (ast.type === 'Cmd') {

      } else {

      }
    }
  }
}
