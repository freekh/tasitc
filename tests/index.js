// FIXME: These tests are written to help dev flow. I don't like TDD really so they should be removed and factored into seperate more correct tests as things go further. I want stable tests, no flacky ones.

const { testable } = require('../code/backend/routers/node-structure');
const parse = require('../code/lang/parser/parse');
const parserError = require('../code/lang/parser/error');
const transpile = require('../code/lang/transpile');

const app = require('../code/backend/app');


// TODO: test cases for: ?
// const text = 'ls | $ | $ | $.path';
// const text = 'h { elem: div, attrs: { class: Test }';
// const text = 'div (ul [#foo {width: 4px, } tst])';
// const text = 'div[{class: test}] test';
// const text = 'ls | sort';
// const text = `html (ls |       li [(div 'test')]) > ~/test`;
// const text = 'html (ul (ls | li $.path))';
// const text = `[ls | li $.path] | { 'test': $ }`;
// const text = `[ls]`
// const text = `{ 'test': $ }`
// const text = `ls | $ | li $.path`;
// const text = `html (ul (ls | li $.path))`;
// const text = `ls | ul $.path`;
// const text = `li foo`;
// const text = `ls`
// const parseTree = parser('html (ul (ls | li $.path))');
// const parseTree = parser('html [$]');
// const parseTree = parser('html (ul ($.cwd | li))');
// const parseTree = parser('ls | $.path ');
// const parseTree = parser('html (ls | [$.path] | (li $))');
// const parseTree = parser("ul (['hei', 'verden'] | li)");

const store = (fixture, user, path, content) => {
  const { backend } = fixture;

};

module.exports = {
  setUp: callback => {
    this.listener = app(env).listen();
    this.port = this.listener.address().port;
    this.server = `http://localhost:${this.port}`;
    callback();
  },
  tearDown: callback => {
    if (this.listener) {
      this.listener.close();
    }
    callback();
  },
  'ls | div $.path': (test) => {
    const user = 'freekh';
    store(this, user, '~/foo', 'foo content');
    store(this, user, '~/bar', 'bar content');
    store(this, user, '~/zoo/foo', 'zoo foo content');
    const text = 'ls ~ | div $.path';
    const expected = {
      mime: 'text/html',
      content: '<div>~/foo</div><div>~/bar</div>',
    };
    const parseTree = parse(text);

    if (!parseTree.status) {
      console.log(parseTree);
      console.error(parserError(parseTree).join('\n'));
    } else {
      console.log(JSON.stringify(parseTree, null, 2));

      const aliases = {
        ls: '/tasitc/ns/ls',
        ul: '/tasitc/dom/ul',
      };
      const cwd = '~';
      const stmt = transpile(parseTree);
      const lookup = () => {
        
      };
      stmt(lookup, Promise.resolve({
        request: { verb: 'get', path: '/tasitc/term/freekh' },
        status: 200,
        mime: 'application/json',
        meta: { cwd: '/freekh' },
        content: { cwd: '/freekh', params: {} },
      })).then(res => {
        console.log('Response', JSON.stringify(res, null, 2));
        console.log(res.content);
        test.done();
      }).catch(err => {
        console.error('ERROR', err);
        console.error(err.stack);
        test.done();
      });
    }
  },
};
