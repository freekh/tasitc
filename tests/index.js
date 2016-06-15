// FIXME: These tests are written to help dev flow. I don't like TDD really so they should be removed and factored into seperate more correct tests as things go further. I want stable tests, no flacky ones.

const { testable } = require('../code/backend/routers/node-structure');
const parse = require('../code/lang/parser/parse');
const parserError = require('../code/lang/parser/error');
const transpile = require('../code/lang/transpile');
const lookup = require('../code/core/lookup');

const pg = require('pg').native;

const express = require('express');
const term = require('../code/backend/routers/term');
const nodeStructure = require('../code/backend/routers/node-structure');

module.exports = {
  setUp: callback => {
    const app = express();
    app.use('/', nodeStructure);
    app.use('/', term);

    this.listener = app.listen();
    this.port = this.listener.address().port;
    this.server = `http://localhost:${this.port}`;
    callback();
  },
  tearDown: callback => {
    if (this.listener) {
      this.listener.close();
    }
    pg.end();
    callback();
  },
  'end-to-end': (test) => {

    let text = 'ls | $ | $ | $.path';
    text = 'h { elem: div, attrs: { class: Test }';
    text = 'div (ul [#foo {width: 4px, } tst])';
    text = 'div[{class: test}] test';
    text = 'ls ';
    //text = 'ls | sort';
    //text = `html (ls |       li [(div 'test')]) > ~/test`;
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
        ul: '/tasitc/dom/ul',
      };
      const cwd = '~';
      const stmt = transpile(parseTree);
      const cache = {};
      cache[cacheKey('/tasitc/dom/ul')]
      stmt(cache, Promise.resolve({
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
