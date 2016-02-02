const Parser = require('src/main/shared/parser')

const testUtils = (test) => {
  return {
    equals: (a, b) => test.deepEqual(a, b, JSON.stringify(a, null, 2) + ' != ' + JSON.stringify(b, null, 2))
  }
}

module.exports = {
    'basic parser eval': (test) => {

      const parser = Parser()
      const asts = {
        html1: [
          {
            type: 'expression',
            value: 'html',
            params: [{
                type: 'expression',
                value: 'h',
                params: [{
                  type: 'string',
                  value: 'div',
                  params: []
                }, {
                  type: 'string',
                  value: 'foo',
                  params: []
                }]
            }, {
                type: 'expression',
                value: 'h',
                params: [{
                  type: 'string',
                  value: 'div',
                  params: []
                }, {
                  type: 'expression',
                  value: 'string',
                  params: [{
                    type: 'int',
                    value: '1'
                  }]
                }]
            }]
          }
        ]
      }
      // testUtils(test).equals(parser.parse(`html (
      // )`), asts.html1)



      // console.log(parser.parse(`#comment
      //   html`))
      console.log(JSON.stringify(parser.parse(`(h 'div' (h 'div.Foo'))`), null, 2))
      console.log(JSON.stringify(parser.parse(`(h)`), null, 2))
      // console.log(parser.parse(`#comment
      //     html (h 'div')`))
      // console.log(parser.parse(`#comment
      //   html (
      //     h 'div'
      //   )`))




      // testUtils(test).equals(parser.parse(`html (
      //   div '#Foo.Bar' [
      //     div '.Zoo' 'hello'
      //   ]
      //   div '.Bar'
      // )`), asts.html2)
      //
      //

      test.done()
    }
    //   testUtils(test).equals(parser.parse(`html (h 'div' 'foo')`), {})
    //   testUtils(test).equals(parser.parse(`html (
    //     h "div" 'foo'
    //   )`), {})
    //   testUtils(test).equals(parser.parse(`(html (
    //     h "div" 'foo'
    //   ) )`), {})
    //   test.done()
    // }
    // 'basic parser eval': (test) => {
    //   const parser = Parser()
    //   const asts = {
    //     'html1': [
    //         {
    //           symbol: 'cmd',
    //           value: 'html',
    //           params: [
    //             {
    //               symbol: 'atom',
    //
    //             }
    //           ]
    //         }
    //       ]
    //     }
    //   }
    //
    //   testUtils(test).equals(parser.parse(`google/name@company.com/mail/list --sort='date'`), {})
    //   testUtils(test).equals(parser.parse(`html (h 'div' 'foo')`), {})
    //   testUtils(test).equals(parser.parse(`html (
    //     h "div" 'foo'
    //   )`), {})
    //   testUtils(test).equals(parser.parse(`(html (
    //     h "div" 'foo'
    //   ) )`), {})
    //   test.done()
    // }
}
