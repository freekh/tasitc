// FIXME: These tests are written to help dev flow. I don't like TDD really so they should be removed and factored into seperate more correct tests as things go further. I want stable tests, no flacky ones.

const { testable } = require('../code/backend/routers/fs');
const parser = require('../code/lang/parser');
const parserError = require('../code/lang/parser/error');
const transpile = require('../code/lang/transpile');

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

    //const parseTree = parser('html (ul (ls | li $.path))');
    //const parseTree = parser('html [$]');
    //const parseTree = parser('html (ul ($.cwd | li))');
    //const parseTree = parser('ls | $.path ');
    //const parseTree = parser('html (ls | [$.path] | (li $))');
    const parseTree = parser("ul (['hei', 'verden'] | li)");
    if (!parseTree.status) {
      console.log(parseTree);
      console.error(parserError(parseTree).join('\n'));
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
  },
};
