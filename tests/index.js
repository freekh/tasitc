// FIXME: These tests are written to help dev flow. I don't like TDD really so they should be removed and factored into seperate more correct tests as things go further. I want stable tests, no flacky ones.

const { testable } = require('../code/backend/routers/node-structure');
const parse = require('../code/lang/parser/parse');
const parserError = require('../code/lang/parser/error');
const transpile = require('../code/lang/transpile');
const normalize = require('../code/term/normalize');

const pg = require('pg').native;

module.exports = {
  tearDown: (callback) => {
    pg.end();
    callback();
  },
  'end-to-end': (test) => {
    let text = 'ls | $ | $ | $.path';
    text = 'ls | sort';
    text = `html (ls | 
         li [(div 'test')]) > ~/test`;
    //text = 'html (ul (ls | li $.path))';

    //text = `[ls | li $.path] | { 'test': $ }`;
    //text = `[ls]`
    //text = `{ 'test': $ }`
    //text = `ls | $ | li $.path`;
    //text = `html (ul (ls | li $.path))`;
    //text = `ls | ul $.path`;
    //text = `li foo`;
    //text = `ls`;

    const parseTree = parse(text);

    //const parseTree = parser('html (ul (ls | li $.path))');
    //const parseTree = parser('html [$]');
    //const parseTree = parser('html (ul ($.cwd | li))');
    //const parseTree = parser('ls | $.path ');
    //const parseTree = parser('html (ls | [$.path] | (li $))');
    //const parseTree = parser("ul (['hei', 'verden'] | li)");
    if (!parseTree.status) {
      console.log(parseTree);
      console.error(parserError(parseTree).join('\n'));
    } else {
      console.log(JSON.stringify(parseTree, null, 2));
      

      const aliases = {
        ls: '/tasitc/ns/ls',
        html: '/tasitc/dom/html',
        body: '/tasitc/dom/body',
        div: '/tasitc/dom/div',
        ul: '/tasitc/dom/ul',
        li: '/tasitc/dom/li',
      };

      const cwd = '/freekh';
      const stmt = transpile(parseTree.value, (id) => {
        const content = normalize(cwd, aliases, id);
        return ($) => {
          return Promise.resolve({
            status: 200,
            mime: 'text/plain',
            content,
          });
        };
      }, parseTree.text);
      stmt(Promise.resolve({
        request: { verb: 'get', path: '/tasitc/term/freekh' },
        status: 200,
        mime: 'application/json',
        content: { cwd: '/freekh', params: {} },
      })).then(res => {
        console.log('Response', JSON.stringify(res, null, 2));
        console.log(res.content);
        test.done();
      }).catch(err => {
        console.error('ERROR', err);
        console.error(err.stack);
      });
    }
  },
};
