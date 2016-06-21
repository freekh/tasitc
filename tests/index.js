const fixture = require('./fixture')();

/* eslint-disable quotes */

// list:
fixture.test(`['he', 'wo']`, ['he', 'wo'], true);

// instance:
fixture.test(`{'path': '/one', 'foo': 'test'}`, { path: '/one', foo: 'test' }, true);
fixture.test(`{'path': '/one', 'foo': 'test'} | $.path`, '/one', true);

// map:
fixture.test(`['he', 'wo'] | map`,
             ['he', 'wo'], true);
fixture.test(`['he', 'wo'] | map $`,
             ['he', 'wo'], true);
fixture.test(`[{'path': '/one'}, {'path': '/two'}] | map $.path`,
             ['/one', '/two'], true);

// flatmap:
fixture.test(`[['hello'], ['world']] | flatmap`,
             ['hello', 'world'], true);
fixture.test(`[['he'], ['wo'], ['rld']] | flatmap $`,
             ['he', 'wo', 'rld'], true);
fixture.test(`['he', 'wo'] | flatmap [$]`,
             ['he', 'wo'], true);
fixture.test(`['he', 'wo', 'rld'] | flatmap [$]`,
             ['he', 'wo', 'rld'], true);
fixture.test(`[['he'], ['wo'], ['rld']] | flatmap [$]`,
             [['he'], ['wo'], ['rld']], true);
// TODO: this 'abc' | split '' | flatmap ifte [regex 'a', $, $]
//       should not be ["a","b","c"]
// TODO: this: l
fixture.test(`ls | map $.name | flatmap ($ | split)`,
             ["d", "i", "r", "f", "i", "l", "t", "e", "r"], true);

// regex:
fixture.test(`'test' | regex 'test'`,
             true, true);
fixture.test(`'test' | regex 'foo'`,
             false, true);
fixture.test(`'test' | regex '[t].*?[t]'`,
             true, true);
// ifte:
fixture.test(`'test' | ifte [regex 'test', 'yes', 'no']`,
             'yes', true);
fixture.test(`'test' | ifte [regex 'foo', 'yes', 'no']`,
             'no', true);

// combinations:
fixture.test(`['foo', 'bar'] | map ifte [regex 'foo', 'yes', 'no']`,
             ['yes', 'no'], true);
fixture.test(`[{'a': 'foo'}, {'a': 'bar'}] | map $.a | map regex 'foo'`,
             [true, false], true);
fixture.test(`[{'a': 'foo'}, {'a': 'bar'}] | map ($.a | regex 'foo')`,
             [true, false], true);
fixture.test(`[{'a': 'foo'}, {'a': 'bar'}] | 
  map ifte [
   $.a | regex 'foo', 
   'yes', 
   'no'
  ]`, ['yes', 'no'], true);
fixture.test(`['he', 'wo', 'rld'] | flatmap ifte [regex 'he', [$], []]`,
             ['he'], true);
// curry:
fixture.test(`'test' | :(regex ?) '[t].*?[t]'`, true, true);
fixture.test(`['hei', 'du'] | :(flatmap ifte [regex ?, [$], []]) 'hei'`, ['hei'], true);

// js:


// request:
fixture.test(`ls '/freekh'`, [{ absolute: '/dir', name: 'dir' },
  { absolute: '/filter', name: 'filter' }], true);
//fixture.test(`regex ?`, [1], true, true);
//fixture.test(`['hei', 'du'] | /freekh/filter 'du'`, [1], true);

/* eslint-enable quotes */

module.exports = fixture.testSuite;
