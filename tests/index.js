// FIXME: These tests are written to help dev flow. I don't like TDD really so they should be removed and factored into seperate more correct tests as things go further. I want stable tests, no flacky ones.

const parse = require('../code/lang/parser/parse');
const parserError = require('../code/lang/parser/error');
const transpile = require('../code/lang/transpile');

const app = require('../code/backend/app');
const testEnv = require('./env');

const fs = require('fs');
const path = require('path');

const list = (fullPath) => {
  return new Promise((resolve, reject) => {
    const dir = path.resolve(fullPath && ('./tests/ns' + fullPath) || './tests/ns/freekh');
    fs.readdir(dir, (err, files) => {
      if (err) {
        reject(err);
      } else {
        return resolve({
          mime: 'application/json',
          status: 200,
          content: files.map(file => {
            return {
              path: path.resolve(dir, file),
              name: file,
            };
          }),
        });
      }
    });
  });
};

const read = (fullPath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve('./tests/ns' + (fullPath || '')), (err, content) => {
      if (err) {
        reject(err);
      } else {
        const js = (script) => {
          return {
            status: 200,
            mime: 'application/js',
            content: script.toString(),
          };
        };
        const tasitc = (script) => {
          return {
            status: 200,
            mime: 'application/vnd.tasitc',
            content: script.toString(),
          };
        };
        resolve(eval(content.toString())); // FIXME: eval!
      }
    });
  });
};

const write = (fullPath, content) => {
  return new Promise((resolve, reject) => {
    const resolvedPath = path.resolve('./tests/ns' + (fullPath || ''));
    fs.writeFile(resolvedPath, content, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          mime: 'text/plain',
          status: 200,
          content: resolvedPath,
        });
      }
    });
  });
};


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

module.exports = {
  setUp: callback => {
    this.app = app(testEnv);
    this.listener = this.app.listen();
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
  'ls | div $.path': test => {
    const user = 'freekh';
    // const text = 'ls ~ | div $.path';
    // const text = 'ls /freekh';
    // https://term.tasitc.com/tasitc/core/dom/div##foo [#foo]
    // https://api.tasitc.com/freekh/div
    const expected = {
      mime: 'text/html',
      content: '<div>/freekh/dir</div><div>/freekh/foo</div><div>/freekh/bar</div>',
    };
    // `ls |> :js { (ctx) => 'hello' + ctx.path }`
    // `css { div { color: red; } }`
    // `ls | :li.Elem $.path | html { :ul $ }`
    // `for [ls, :li]`; $[0] |> map $[1]
    // `ls |> map (:li $.path)`
    // `ls |> flatmap (:li [$.path])`
    // `ls |> reduce [0, concat]`
    // `html [ :style css { div { color: red; } }, ]` 
    // `html { :div [.foo]) }`;
    // `html :div ['test'])`;
    // `html :div [.foo 'test']`;
    // `html :div [{} 'test']`;
    // `html :div [.foo {}]`;
    // `html :div.foo [{} 'test']`;

    // ls |> {
    //   [ { path: 'path' }, ?] if (:gt (:len ?node.path) 10) => ?node.path
    //   ? => fail
    // }

    // ls |> transduce [map $.path, flatmap :li] ;;ls | $.path | :li
    // ls |> map $.path |> flatmap :span#char |> html > foo
    // ls |> map $.path | :span#char |> html > foo

    // mount (/github/freekh --account=(ls ~/.accounts/github |> $[0])) > ~/github
    // ln ~/github/tasitc/trees/release > ~/myapp/code
    // cd ~/myapp
    // hook [
    //   ./package.json
    //   :/js/lock ./package.json |> ifte [eq [$.sha1  ./lock |> $.sha1], $, ./lock]
    // ] > ./lock
    // hook [

    //   [./code/**.js, ./lock]
    //   /browersify { entry: ./code/index.js, babelify: true } |> /tgz
    // ] > ./main.js.tgz
    // expose main.js.tgz
    // html [
    //   :body [
    //     :div#entry.test
    //     :script (url ./main.js.tgz)
    //   ]
    // ] >> ./index.html
    // expose index.html
    // ALT:
    // html [
    //   :body [
    //     :ul (ls |> map (:li $.path))
    //   ]
    // ]
    // ls |> map (if [{ ?path }, 'nope'])
    // { ?path, foo: 'value' } |> if [(gt [len $, 10]), ]
    // [ ?one, ?two, ?rest ]

    //const text = `ls | map $.path | $[0] | ifte [contains 'freekh', $, 'nope'] | html`;
    //const text = `request /tasitc/core/ns/list > /tasitc/ns/ls`; // or request --get ?,  should it be possible to write request --verb='get' > /tasitc/requests/get
    //const text = `map > /mapalt`; //%{ } / %&
    //const text = `[ls, 'freekh'] | swap map ifte [$.path | contains, $.name, 'nope']`;
    // ls | map $.path | filter 'freekh'
    // filter => [$, 'freekh'] | flatmap ifte [$[0] | contains $[1], [$[0]], []]
    //const text = `$ | filter 'freekh'`;
    const text= `filter < flatmap ifte [regex ?, [$], []]`;
    //const text = `foo < js ((context, argument) => { return context + argument; })`; // ls | map :foo 'yeah'
    // dup 0 eq | [ pop 1 ] | [ dup 1 - fac * ] | if > fac

    // map ifte [$ | contains ?.sql, [$], []] > filter
    // ls | filter 'freekh'
    // '/tasitc/ns/core/ls' | request --get ? > ls
    // ls | sort | map psql { sql: "select $.name from names" }
    // '/tasitc/db/psql' | request --credentials=(credentials 'psql') ?.sql
    //const text = `ls | map $.path | /freekh/filter 'zoo'`;
    //const text = `ls | map $.path | filter 'freekh'`;
    //const text = `ls | map ifte [$.path | contains 'freekh', :li $.name, 'nope'] | html`;
    //const text = `ls | map ifte [$.path | contains 'freekh', 'yes', 'nope']`;
    // const text = `ls | map :li $.name`;
    // ls |> [map, ifte [ge [(len $.path) 200], $.path, 'too long']]
    const parseTree = parse(text);
    if (!parseTree.status) {
      console.log(parseTree);
      console.error(parserError(parseTree).join('\n'));
      test.done();
    } else {
      console.log(JSON.stringify(parseTree, null, 2));
      const expr = transpile(parseTree);
      const fakeReq = {
        mime: 'application/json',
        type: 'get',
        path: `/~${user}`,
        meta: {
          term: true,
          cwd: `/${user}`,
          user,
        },
      };
      const aliases = {
        map: '/tasitc/core/combinators/map',
        flatmap: '/tasitc/core/combinators/flatmap',
        //
        ifte: '/tasitc/core/combinators/ifte',
        contains: '/tasitc/core/combinators/contains',
        //
        text: '/tasitc/core/combinators/text',
        html: '/tasitc/core/combinators/html',
        //
        ls: '/tasitc/core/ns/list',
        write: '/tasitc/core/ns/write',
        //
        li: '/tasitc/dom/li',
      };
      const request = (path, context) => {
        if (path === '/tasitc/core/ns/list') {
          return list(context.content);
        } else if (path === '/tasitc/core/ns/write') {
          return write(path, context.content);
        }
        return read(path);
      };
      expr(fakeReq, Promise.resolve(aliases), request).then($ => {
        console.log('-->', JSON.stringify($));
        test.done();
      }).catch(err => {
        console.error(err);
        test.done();
      });
    }

  },
};
