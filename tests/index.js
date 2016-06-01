// FIXME: These tests are written to help dev flow. I don't like TDD really so they should be removed and factored into seperate more correct tests as things go further. I want stable tests, no flacky ones.

const { testable } = require('../code/backend/routers/fs');
const { parse, error } = require('../code/lang/grammar');
const execute = require('../code/lang/execute');

const reduce = require('../code/misc/reduce');


const pg = require('pg').native;


module.exports = {
  tearDown: (callback) => {
    pg.end();
    callback();
  },
  'end-to-end': (test) => {
    let text = 'ls | $ | $ | $.path';
    text = 'ls | sort';
    text = 'ls | li $.path';
    text = 'html (ul (ls | li $.path))';

    //text = `[ls | li $.path] | { 'test': $ }`;
    //text = `[ls]`
    //text = `{ 'test': $ }`
    //text = `ls | $ | li $.path`;
    //text = `html (ul (ls | li $.path))`;
    //text = `ls | ul $.path`;
    //text = `li foo`;
    //text = `ls`;
    // const parseTree = parse(text);
    // if (parseTree.status) {
    //   //console.log(JSON.stringify(parseTree, null, 2));
    //   execute(parseTree).then(resolved => {
    //     test.done();
    //   }).catch(err => {
    //     test.done();
    //   });
    // } else {
    //   console.error(error(parseTree, text).join('\n'));
    //   test.done();
    // }

    // const a = reduce([
    //   ($$) => {
    //     const content = $$.response.content.map && $$.response.content.map($ => {
    //       return [
    //         { path: 'a.txt' },
    //         { path: 'b.txt' },
    //         { path: 'c.txt' },
    //       ];
    //     }) || [
    //       { path: 'a.txt' },
    //       { path: 'b.txt' },
    //       { path: 'c.txt' },
    //     ];
    //     return Promise.resolve({
    //       response: {
    //         status: 200,
    //         content,
    //       },
    //     });
    //   },
    //   ($$) => {
    //     const promiseArg = reduce([$ => {
    //       return Promise.resolve({
    //         response: {
    //           status: 200,
    //           content: $.response.content.map($ => {
    //             return $.path;
    //           }),
    //         },
    //       });
    //     }], $$);
    //     return promiseArg.then($ => {
    //       return reduce([$ => {
    //         return Promise.resolve({
    //           response: {
    //             status: 200,
    //             content: $.response.content.map($ => {
    //               return `<li>${$}</li>`;
    //             }),
    //           },
    //         });
    //       }], $);
    //     });
    //   },
    // ], Promise.resolve({ request: { type: 'post' }, response: { status: 200, content: '' } }));
    // a.then(res => {
    //   console.log('reduced to', JSON.stringify(res, null, 2));
    //   test.done();
    // }).catch(err => {
    //   console.error(err);
    //   console.error(err.stack);
    // });

    const request = (path, argRaw) => {
      const promiseArg = argRaw instanceof Promise ?
              argRaw : Promise.resolve(argRaw);

      return promiseArg.then(argResponse => {
        if (argResponse && argResponse.status !== 200) {
          return Promise.reject(argResponse);
        }
        const arg = argResponse ? argResponse.content : '';

        let content = '';
        let mime = 'text/plain';
        if (path === '/tasitc/dom/html') {
          content = `<html>${arg}</html>`;
          mime = 'text/html';
        } else if (path === '/tasitc/dom/ul') {
          if (arg instanceof Array) {
            content = `<ul>${arg.join('')}</ul>`;
          } else {
            content = `<ul>${arg}</ul>`;
          }
          mime = 'text/html';
        } else if (path === '/tasitc/dom/li') {
          console.log('ARG', arg);
          content = `<li>${arg}</li>`;
          mime = 'text/html';
        } else if (path === '/tasitc/fs/ls') {
          mime = 'application/json';
          content = [{ path: 'a.txt' }, { path: 'b.txt' }, { path: 'c.txt' }];
        } else {
          return Promise.reject({
            status: 404,
            content,
            mime,
          });
        }
        return Promise.resolve({
          status: 200,
          content,
          mime,
        });
      });
    };

    const map = (form) => {
      return ($) => {
        return Promise.all($.content.map(content => {
          return form({
            mime: $.mime,
            status: $.status,
            content,
          });
        })).then(responses => {
          return {
            status: $.status,
            mime: $.mime,
            content: responses.map(r => {
              return r.content;
            }),
          };
        });
      };
    };

    const tap = ($) => {
      if ($ instanceof Promise) {
        return $.then($ => {
          console.log('TAP', $);
          return $;
        });
      }
      console.log('TAP', $);
      return Promise.resolve($);
    };

    // `html (ul (ls | li $.path))`;

    const ex1 = ($) => request('/tasitc/dom/html', reduce([
      ($) => request('/tasitc/dom/ul', reduce([
        ($) => reduce([
          ($) => request('/tasitc/fs/ls', reduce([
          ], $)),
          map(
            ($) => request('/tasitc/dom/li', reduce([
              ($) => {
                return Promise.resolve({
                  status: 200,
                  mime: 'application/json',
                  content: $.content.path,
                });
              },
            ], $))
          ),
        ], $),
      ], $)),
    ], $));


    const transpile = (node, text) => {
      if (node.type === 'Call') {
        const path = transpile(node.id, text);
        const arg = node.arg ? transpile(node.arg, text) : null;
        return ($) => {
          return request(path, arg ? arg($) : $);
        };
      } else if (node.type === 'Chain') {
        const elements = node.elements.map((node, i) => {
          if (i > 0) {
            const chained = transpile(node, text);
            return map(chained);
          }
          return transpile(node, text);
        });
        return ($) => reduce(elements, $);
      } else if (node.type === 'Id') {
        return node.value;
      } else if (node.type === 'Context') {
        return ($) => {
          return Promise.resolve({
            status: 200,
            mime: 'application/json',
            content: $.content.path,
          });
        };
      }
//      } else if (node.type === 'Stack') {
//      } else if (node.type === 'Instance') {
//      } else if (node.type === 'List') {
//      }
      throw new Error(`Unknown AST node (${node.type}): ${JSON.stringify(node)}`);
    };

    const parseTree = parse('/tasitc/dom/html (/tasitc/dom/ul (/tasitc/fs/ls | /tasitc/dom/li $.path))');
    console.log(JSON.stringify(parseTree, null, 2));

    const stmt = transpile(parseTree.value, parseTree.text);
    stmt(Promise.resolve({
      requests: [{ verb: 'get', path: '/tux/freekh' }],
      status: 200,
      mime: 'application/json',
      content: { cwd: '/freekh', params: {} },
    })).then(res => {
      console.log('Response', res);
      test.done();
    }).catch(err => {
      console.error('ERROR', err);
      console.error(err.stack);
    });

    
    // into({ mime: 'text/plain', content: ''}, comp(
    // ), { mime: 'text/plain', content: ''});

    // const text = 'ls | $ | $ | $.path';
    // html (ul (transduce (comp (map #(%.path)) (filter % === 'file.txt'))  ls))

    // ls | $.path | grep 'file.txt' | html (ul ($ | li))
    // html(ul(into([], comp())


    // ls == transducer

    // {a: foo} | $.a

    // reduce ls | $.path
    //
    // flatmap ls | map $.permissions | $.user
    // ls | $.path
    // a | $.url //?a={url: ''}
    // ls | $ | $ | $.path
    // a.chain($ => b($)).chain($ => c($))
    // for [a (range 5) :when (odd? a)] (* 2 a)
    // gsheet2json: [{  }]
    // /google/drive | gsheet2json | $.
    // foo (ls)
    // foo [{path: 'f.txt'}, {path:'g.txt'}]
    // [{path: 'f.txt'}, {path:'g.txt'}] | $.path
    // [{a: [ { b: 'f.txt' } ]} ] | $.a | $.b // [[f.txt]]
    // [{a: [ { b: 'f.txt' } ]} ] | $.a |> $.b // [f.txt]
    // console.log([0, 1, 2, 3, 4, 5].reduce((list,x) => list.concat([x, x+'']), []));
    // const path = '/freekh/test';
    // const parseTree = parse(text);
    // test.ok(parseTree.status);
    // testable.write(path, text)
    //   .then(() => {
    //     return testable.read(path);
    //   })
    //   .then(result => {
    //     test.equal(result, text);
    //     return execute(parseTree);
    //   })
    //   .then(result => {
    //     console.log(result);
    //     test.done();
    //   })
    //   .catch(err => {
    //     test.ok(false, err);
    //     test.done();
    //   }
    // );
  },
};
