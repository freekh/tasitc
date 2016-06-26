const fixture = require('./fixture')();

/* eslint-disable quotes */

if (true) {
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
  fixture.test(`ls | map $.name | flatmap ($ | split)`,
               ["d", "i", "r", "g", "r", "e", "p"], true, true);
  fixture.test(`ls | flatmap ls`, [
    { absolute: '/dir', name: 'dir' },
    { absolute: '/grep', name: 'grep' },
    { absolute: '/dir', name: 'dir' },
    { absolute: '/grep', name: 'grep' },
  ], true);

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
  fixture.test(`regex ?`, true, true);
  fixture.test(`'test' | (regex ?) '[t].*?[t]'`, true, true);
  fixture.test(`['hei', 'du'] | (flatmap ifte [regex ?, [$], []]) 'hei'`, ['hei'], true);

  // js:


  // // request:
  // fixture.test(`'test' | /freekh/regex '[t].*?[t]'`, true, true, true);
  // fixture.test(`ls '/freekh'`, [{ absolute: '/dir', name: 'dir' },
  //                               { absolute: '/grep', name: 'grep' }], true);
  // fixture.test(`['hei', 'du'] | /freekh/grep 'du'`, [1], true);
}
fixture.test(`regex ?`, ['hei'], true, true);
fixture.test(`['hei', 'du'] | (flatmap ifte [regex ?, [$], []]) 'hei'`, ['hei'], true, true);

/* eslint-enable quotes */

module.exports = fixture.testSuite;
