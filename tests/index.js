// FIXME: These tests are written to help dev flow. I don't like TDD really so they should be removed and factored into seperate more correct tests as things go further. I want stable tests, no flacky ones.

const parse = require('../code/lang/parser/parse');
const parserError = require('../code/lang/parser/error');
const transpile = require('../code/lang/transpile');

const app = require('../code/backend/app');
const testEnv = require('./env');


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
    const text = `ls | map ifte [$.path | contains 'freekh', :li $.path, 'nope']`;
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
      expr(fakeReq).then($ => {
        console.log('-->', JSON.stringify($));
        test.done();
      }).catch(err => {
        console.error(err);
        test.done();
      });
    }

  },
};
