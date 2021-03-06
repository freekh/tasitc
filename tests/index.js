const fixture = require('./fixture')();
const { Json, Node, Text, DomElement, Html } = require('../code/lang/primitives');
const ast = require('../code/lang/ast');

/* eslint-disable quotes */

if (true) {
  // list:
  fixture.test(`['he', 'wo']`, new Json(['he', 'wo']), true);

  // instance:
  fixture.test(`{'path': '/one', 'foo': 'test'}`,
    new Json({ path: '/one', foo: 'test' }), true);
  fixture.test(`{'path': '/one', 'foo': 'test'} | $.path`, new Text('/one'), true);

  // map:
  fixture.test(`['he', 'wo'] | map`,
                new Json(['he', 'wo']), true);
  fixture.test(`['he', 'wo'] | map $`,
                 new Json(['he', 'wo']), true);
  fixture.test(`[{'path': '/one'}, {'path': '/two'}] | map $.path`,
               new Json(['/one', '/two']), true);

  // flatmap:
  fixture.test(`[['hello'], ['world']] | flatmap`,
               new Json(['hello', 'world']), true);
  fixture.test(`[['he'], ['wo'], ['rld']] | flatmap $`,
               new Json(['he', 'wo', 'rld']), true);
  fixture.test(`['he', 'wo'] | flatmap [$]`,
               new Json(['he', 'wo']), true);
  fixture.test(`['he', 'wo', 'rld'] | flatmap [$]`,
               new Json(['he', 'wo', 'rld']), true);
  fixture.test(`[['he'], ['wo'], ['rld']] | flatmap [$]`,
               new Json([['he'], ['wo'], ['rld']]), true);

  // ls:
  fixture.test(`ls`,
               new Json([{ absolute: '/freekh/dir', name: 'dir' },
                         { absolute: '/freekh/grep.tasitc', name: 'grep.tasitc' },
                         { absolute: '/freekh/h1.js', name: 'h1.js' }]), true);
  fixture.test(`ls '/freekh'`,
               new Json([{ absolute: '/freekh/dir', name: 'dir' },
                         { absolute: '/freekh/grep.tasitc', name: 'grep.tasitc' },
                         { absolute: '/freekh/h1.js', name: 'h1.js' }]), true);

  // regex:
  // there is no mime type for Boolean, which is why it is text, but...
  fixture.test(`'test' | regex 'test'`,
               new Text('true'), true);
  fixture.test(`'test' | regex 'foo'`,
               new Text('false'), true);
  fixture.test(`'test' | regex '[t].*?[t]'`,
               new Text('true'), true);
  // ifte:
  fixture.test(`'test' | ifte [regex 'test', 'yes', 'no']`,
               new Text('yes'), true);
  fixture.test(`'test' | ifte [regex 'foo', 'yes', 'no']`,
               new Text('no'), true);

  // combinations:
  fixture.test(`['foo', 'bar'] | map ifte [regex 'foo', 'yes', 'no']`,
               new Json(['yes', 'no']), true);
  fixture.test(`[{'a': 'foo'}, {'a': 'bar'}] | map $.a | map regex 'foo'`,
               new Json([true, false]), true);
  fixture.test(`[{'a': 'foo'}, {'a': 'bar'}] | map ($.a | regex 'foo')`,
               new Json([true, false]), true);
  fixture.test(`ls | map $.name | flatmap ($ | split)`,
               new Json(["d", "i", "r",
                         "g", "r", "e", "p", '.', 't', 'a', 's', 'i', 't', 'c',
                         "h", "1", ".", "j", "s"]), true);
  fixture.test(`ls | flatmap ls`, new Json([
    { absolute: '/freekh/dir', name: 'dir' },
    { absolute: '/freekh/grep.tasitc', name: 'grep.tasitc' },
    { absolute: '/freekh/h1.js', name: 'h1.js' },
    { absolute: '/freekh/dir', name: 'dir' },
    { absolute: '/freekh/grep.tasitc', name: 'grep.tasitc' },
    { absolute: '/freekh/h1.js', name: 'h1.js' },
    { absolute: '/freekh/dir', name: 'dir' },
    { absolute: '/freekh/grep.tasitc', name: 'grep.tasitc' },
    { absolute: '/freekh/h1.js', name: 'h1.js' },
  ]), true);
  fixture.test(`['he', 'wo', 'rld'] | flatmap ifte [regex 'he', [$], []]`,
               new Json(['he']), true);

  // multi line:
  fixture.test(`[{'a': 'foo'}, {'a': 'bar'}] |
  map ifte [
   $.a | regex 'foo',
   'yes',
   'no'
  ]`, new Json(['yes', 'no']), true);

  // curry:
  fixture.test(`'test' | (regex ?) '[t].*?[t]'`, new Text('true'), true);
  fixture.test(`['hei', 'du'] | (flatmap ifte [regex ?, [$], []]) 'hei'`,
               new Json(['hei']), true);
  fixture.test(`regex ?`, new Node(
    new ast.Partial(new ast.Id('regex'), new ast.Curry())), true);

  // js:
  // fixture.test(`'slag' | :js {(arg, ctx) => 'a' + arg + ctx; } 'alle'`,
  //              new Text('balleslag'), true);
  // fixture.test(`js { (arg, ctx, variant) => 'a' + arg + ctx + variant; } > /freekh/test`,
  //              new Text('/freekh/test'), true);
  fixture.test(`:/freekh/h1[#au] 'balle'`,
               new DomElement('h1', { id: 'au' }, 'balle'), true);
  // html:
  fixture.test(`html [:/freekh/h1[#foo] 'test']`,
               new Html([
                 new DomElement('body', {}, [
                   new DomElement('h1', { id: 'foo' }, 'test'),
                 ]),
               ]), true);
  // sink:
  fixture.test(`flatmap ifte [regex ?, [$], []] > /freekh/grep`,
               new Text('/freekh/grep.tasitc'), true);
  fixture.test(`ls /freekh | map $.name > /example`,
               new Text('/example.tasitc'), true);
  // request:
  fixture.test(`['hei', 'du'] | /freekh/grep '[d].*?'`, new Json(['du']), true);
  fixture.test(`request http://echo.jsontest.com/key/value/one/two`, new Json({
    one: 'two',
    key: 'value',
  }), true, true);

  // ??: TODO Figure out what this tests or remove? associativity     0?
  // fixture.test(`ls | flatmap ($.name | ifte [regex 'dir', [$], []])`, new Json(['dir']), true);
  // fixture.test(`ls | flatmap (($.name | ?) (ifte [regex 'dir', [$], []]))`, new Json(['dir']), true, true);
  // fixture.test(`ls | flatmap (($.name | ?) grepish)`, new Json(['dir']), true, true); // where grepish == ifte [regex 'dir', [$], []]
  // fixture.test(`ls | flatmap (($.name | ?) (grepish2 'dir'))`, new Json(['dir']), true, true); // where grepish2 == ifte [regex ?, [$], []]
  // fixture.test(`ls | flatmap (($.name | ?) (ifte [regex 'dir', [$], []]) | $.absolute)`, new Json(['dir']), true, true); // should be the same as: ls | flatmap ($.name | (ifte [regex 'dir', [$], []] | $.absolute))

  // TODO:
  // ls | map ($.name | /freekh/grep ?) 'test'
  // ls | flatmap ($.name | ifte [regex 'test', [$], []])
}

/* eslint-enable quotes */


module.exports = fixture.testSuite;
