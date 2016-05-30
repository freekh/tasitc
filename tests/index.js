// FIXME: These tests are written to help dev flow. I don't like TDD really so they should be removed and factored into seperate more correct tests as things go further. I want stable tests, no flacky ones.

const { testable } = require('../code/backend/routers/fs');
const { parse, error } = require('../code/lang/grammar');
const execute = require('../code/lang/execute');

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
    text = `{ 'test': $ }`
    //text = `ls | $ | li $.path`;
    //text = `html (ul (ls | li $.path))`;
    //text = `ls | ul $.path`;
    //text = `li foo`;
    //text = `ls`;
    console.log(text);
    const parseTree = parse(text);
    if (parseTree.status) {
      //console.log(JSON.stringify(parseTree, null, 2));
      execute(parseTree);
      test.done();
    } else {
      console.error(error(parseTree, text).join('\n'));
      test.done();
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
