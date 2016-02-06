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


      const exprs = [
        `#comment
          html`,

        `ls ~/dir`,
        `ls '~/my dir'`,
        `(ls ~/dir)`,
        `(ls '~/my dir')`,
        `(ls '~/my dir' 'blah me' 'blah me2')`,

        `#comment
          (h 'div' (h 'div.Foo'))`,

        `(h 'div' (h 'div.Foo' (string 'blah \\' bah')))`,

        `(h 'div' (h "div.Foo" (string "blah '\\"' bah")))`, //I dont think it works if we do a double escape, so fix that...

        `(h)`,

        `#comment
            html (h 'div')`,

        `#comment
          html (
            h 'div'
          )`,

        `['test' 'cool']`,

        `div '#Foo.Bar' [
            div '.Zoo' 'hello'
            div 'Test-Class'
          ]`, //TODO: div 'foo' [][][] works?
        // // //TOOD: ?? `div .Zoo`
        // //

        `cat ./foo.json | $.bar`,

        `(cat ./foo.json) | $.bar`,

        `(~/google/mail --sort='name' --account='foo')`,

        `(~/google/mail --sort='name' --account='foo') | li ?.title`,


        `html (
          ul (~/google/mail --account=(account freekh@gmail.com) | li ?.title)
        )`,

        `~/google/mail --account=(account freekh@gmail.com) > ~/gmail`, //not needed

        `h { "style": { "color": "red" } } 'test'`,

        `html [
          h1 { "style": { "color": "red" } } (~/google/drive/cat --account=(account freekh@gmail.com) Document.gdoc |
            ~/google/drive/gdoc2html | $ '.Title'
          )
          ul (~/google/mail --account=(account freekh@gmail.com) | li ?.title)
        ]`,
        `html [
          h1 (~/google/drive/cat --account=(account ?.account) Document.gdoc |
            ~/google/drive/gdoc2html | $ 'h1'
          )
          ul (~/google/mail --account=(account ?.account) | li ?.title)
        ] > post ~/public/stuff`,

        `{ "elem": "ul.Mails" } | html [
          h1 (~/google/drive/cat --account=(account ?.account) Document.gdoc |
            ~/google/drive/gdoc2html | $ '.Title'
          )
          h ?.elem
        ] (
            js/tsitc-inject { "mails": url (~/google/mail --account=(account ?.account) | li ?.title), "elem": ?.elem }
        ) (js """
         $(document).load(() => {
           xhr.open(tsitc.mails));
           xhr.load = () => {
             JSON.parse(xhr.response).forEach(mail => $(tsitc.elem).appendChild($(<li>).text(mail.title)))
           };
           xhr.send()
         })
        """ | /babel)  (js (url /jquery)) > post ~/public/fancy-stuff`
      ]

      exprs.forEach(expr => {
        console.log('##############################')
        console.log(expr)
        console.log('##############################')

        const res = parser.parse(expr)
        if (true || !res.status) {
          console.log(JSON.stringify(res, null, 2))
        }
      })

      //
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
