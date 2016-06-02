// FIXME: These tests are written to help dev flow. I don't like TDD really so they should be removed and factored into seperate more correct tests as things go further. I want stable tests, no flacky ones.

const { testable } = require('../code/backend/routers/fs');
const { parse, error } = require('../code/lang/grammar');
const execute = require('../code/lang/execute');

const reduce = require('../code/misc/reduce');

const h = require('hyperscript');


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

    const responseToHyperscript = (elemType, res) => {
      if (res.mime === 'text/plain') {
        return h(elemType, res.content);
      } else if (res.mime === 'application/json') {
        if (res.content instanceof Array) {
          const jsonContent = res.content.map(JSON.stringify).join('');
          const elem = h(elemType);
          elem.innerHTML = jsonContent;
          return elem;
        } else if (typeof res.content === 'string') {
          return h(elemType, res.content);
        } else if (res.content instanceof Object) {
          return h(elemType, res.content, []);
        }
        return res.content;
      } else if (res.mime === 'text/html') {
        const elem = h(elemType);
        elem.innerHTML = res.content;
        console.log(elemType, res, elem);
        return elem;
      }
      console.log('WUT', elemType, res);
      return res.content.toString();
    };

    const request = (promisedPath, argRaw) => {
      const promiseArg = argRaw instanceof Promise ?
              argRaw : Promise.resolve(argRaw);

      return Promise.all([promisedPath, promiseArg]).then(([pathResponse, argResponse]) => {
        if (argResponse && argResponse.status !== 200) { // TODO: could be different than 200
          return Promise.reject({
            status: 404,
            mime: 'text/plain',
            content: `Malformed argument ${JSON.stringify(argResponse)}`,
          });
        }
        const arg = argResponse ? argResponse.content : '';
        const path = pathResponse.content; // TODO: check status
        let content = '';
        let mime = 'text/plain';
        if (path === 'html') {
          content = responseToHyperscript('html', argResponse).outerHTML;
          mime = 'text/html';
        } else if (path === 'ul') {
          content = responseToHyperscript('ul', argResponse).outerHTML;
          mime = 'text/html';
        } else if (path === 'li') {
          content = responseToHyperscript('li', argResponse).outerHTML;
          mime = 'text/html';
        } else if (path === 'ls') {
          mime = 'application/json';
          content = [{ path: 'ab' }, { path: 'cd' }, { path: 'ef' }];
        } else {
          return Promise.reject({
            status: 404,
            content: `Could not find/execute: ${JSON.stringify(path)}`,
            mime: 'application/json',
          });
        }
        return Promise.resolve({
          status: 200,
          content,
          mime,
        });
      });
    };

    const asIterable = (init) => {
      let content = init;
      if (typeof content === 'string') {
        content = content.indexOf('\n') !== -1 ? content.split('\n') : content.split('');
      }
      return content;
    };

    const map = (form) => {
      return ($) => {
        const content = asIterable($.content);
        if (content.map) {
          return Promise.all(content.map(content => {
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
        }
        return Promise.reject({
          status: 500,
          mime: 'text/plain',
          content: `Cannot compose (map) ${JSON.stringify($.content)}`,
        });
      };
    };


    const flatMap = (form) => {
      return ($) => {
        const content = asIterable($.content);
        let flattened = null;
        if (content.reduce) {
          // TODO: not very efficient nor elegant (could flatten during mapping):
          flattened = content.reduce((listlike, value) => {
            if (listlike === null || value === null) {
              return null;
            }
            const listlikeIter = asIterable(listlike);
            if (listlikeIter.concat) {
              return listlikeIter.concat(asIterable(value));
            }
            return null;
          });
        }
        if (flattened && flattened.map) {
          return Promise.all(flattened.map(content => {
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
        }
        return Promise.reject({
          status: 500,
          mime: 'text/plain',
          content: `Cannot compose (reduce) ${JSON.stringify($.content)}`,
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

    const ex1 = ($) => request('html', reduce([
      ($) => request('ul', reduce([
        ($) => reduce([
          ($) => request('ls', reduce([
          ], $)),
          map(
            ($) => request('li', reduce([
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
          return request(path($), arg ? arg($) : $);
        };
      } else if (node.type === 'Chain') {
        const elements = node.elements.map((element, i) => {
          if (i === 0) {
            return transpile(element, text);
          } else if (i === 1) {
            const chained = transpile(element, text);
            return map(chained);
          } else if (i > 1) {
            const flatChained = transpile(element, text);
            return flatMap(flatChained);
          }
          throw Error(`Unexpected index '${i}' of elements ${JSON.stringify(node)}`);
        });
        return ($) => reduce(elements, $);
      } else if (node.type === 'Id') {
        return ($) => Promise.resolve({
          status: 200,
          mime: 'text/plain',
          content: node.value,
        }); // TODO: is $ function + Promise necessary?
      } else if (node.type === 'Str') {
        return ($) => Promise.resolve({
          status: 200,
          mime: 'text/plain',
          content: node.value,
        }); // TODO: is $ function + Promise necessary?
      } else if (node.type === 'Context') {
        return ($) => {
          const context = $ instanceof Promise ? $ : Promise.resolve($);
          return context.then($ => {
            let content = $.content;
            let mime = $.mime;
            const status = $.status;
            let missingAttribute = null;
            node.path.forEach(element => { // FIXME: ? prefer transpiling outside of function
              if (content) {
                if (element.type === 'Attribute') {
                  content = content[element.attr.value]; // FIXME: transpile instead or change AST?
                } else {
                  throw Error(`Could not handle element ${JSON.stringify(element)} ` +
                              `in node: ${JSON.stringify(node)}`);
                }
              }
              if (!content) {
                missingAttribute = element.attr.value;
              }
            });
            if (node.path.length) {
              if (!content) {
                return Promise.reject({
                  mime: 'text/plain',
                  status: 500,
                  content: `No attribute ${missingAttribute} in ${JSON.stringify($.content)}`,
                });
              } else if (typeof content === 'string') { //note: typeof: http://stackoverflow.com/questions/203739/why-does-instanceof-return-false-for-some-literals
                mime = 'text/plain';
              }
              // TODO: mroe here?
            }
            return {
              status,
              mime,
              content,
            };
          });
        };
      } else if (node.type === 'List') {
        return ($) => {
          // FIXME: smells bad
          const promisedResponses = Promise.all(node.elements.map(element => {
            return transpile(element, text)($);
          }));
          return promisedResponses.then(responses => {
            const content = responses.map(response => response.content);
            return {
              status: 200,
              mime: 'application/json',
              content,
            };
          });
        };
      }
//      } else if (node.type === 'Stack') {
//      } else if (node.type === 'Instance') {
//      } else if (node.type === 'List') {
//      }
      throw new Error(`Unknown AST node (${node.type}): ${JSON.stringify(node)}`);
    };

    //const parseTree = parse('html (ul (ls | li $.path))');
    const parseTree = parse('html [$]');
    //const parseTree = parse('html (ul ($.cwd | li))');
    //const parseTree = parse('ls | $.path ');
    //const parseTree = parse('html (ls | [$.path] | (li $))');
    //const parseTree = parse("ul (['hei', 'verden'] | li)");
    if (!parseTree.status) {
      console.log(parseTree);
      console.error(error(parseTree).join('\n'));
    } else {
      console.log(JSON.stringify(parseTree, null, 2));

      const stmt = transpile(parseTree.value, parseTree.text);
      stmt(Promise.resolve({
        request: { verb: 'get', path: '/tux/freekh' },
        status: 200,
        mime: 'application/json',
        content: { cwd: '/freekh', params: {} },
      })).then(res => {
        console.log('Response', JSON.stringify(res, null, 2));
        test.done();
      }).catch(err => {
        console.error('ERROR', err);
        console.error(err.stack);
      });
    }
    
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
