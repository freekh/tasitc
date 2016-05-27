// FIXME: These tests are written to help dev flow. I don't like TDD really so they should be removed and factored into seperate more correct tests as things go further. I want stable tests, no flacky ones.

const { testable } = require('../code/backend/routers/fs');
const { parse } = require('../code/lang/grammar');
const execute = require('../code/lang/execute');

const pg = require('pg').native;


module.exports = {
  tearDown: (callback) => {
    pg.end();
    callback();
  },
  'end-to-end': (test) => {
    const text = 'ls | $ | $ | $.path';

    // html (ul (transduce (comp (map #(%.path)) (filter % === 'file.txt'))  ls))

    // ls | $.path | grep 'file.txt' | html (ul ($ | li))

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
    //console.log([0, 1, 2, 3, 4, 5].reduce((list,x) => list.concat([x, x+'']), []));
    const path = '/freekh/test';
    const parseTree = parse(text);
    test.ok(parseTree.status);
    testable.write(path, text)
      .then(() => {
        return testable.read(path);
      })
      .then(result => {
        test.equal(result, text);
        return execute(parseTree);
      })
      .then(result => {
        console.log(result);
        test.done();
      })
      .catch(err => {
        test.ok(false, err);
        test.done();
      });
  },
};
