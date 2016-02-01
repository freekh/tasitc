const Parser = require('src/main/shared/parser')

const testUtils = (test) => {
  return {
    equals: (a, b) => test.equals(a, b, a + ' != ' + b)
  }
}


module.exports = {
    'basic parser eval': (test) => {
      const parser = Parser()
      const asts = {
        'html1': [
            {
              symbol: 'cmd',
              value: 'html',
              type: 'Html',
              params: [
                {
                  symbol: 'atom',

                }
              ]
            }
          ]
        }
      }

      testUtils(test).equals(parser.parse(`html (
        h 'div' 'foo'
      )`), {})
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
};
