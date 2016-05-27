// FIXME: These tests are written during TDD - they should be removed and factored into seperate more correct tests as things go further

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
    const text = 'ls | html (ul ($ | li $.path))';
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
      .then(() => {
        test.done();
      })
      .catch(err => {
        test.ok(false, err);
        test.done();
      });
  },
};
