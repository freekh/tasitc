const fs = require('fs');
const ohm = require('ohm-js');

const contents = fs.readFileSync('tas.ohm');
const g = ohm.grammar(contents);

const semantics = g.createSemantics().addOperation('eval', {
  Cmd_TAS: function(e) {
    return e.eval();
  },
  NonemptyListOf: function(first, _, rest) {
    return rest.reduce((prev, curr) => {
      return curr.eval();
    }, first.eval());
  },
  Val: function(_, e, _) {
    return e.eval();
  },
  ArrayLiteral: function(e) {
    return e.eval();
  },
  Expr: function(e) {
    return e.eval();
  }
});

const testCases = [
  // `
  // {
  //   rule1: str = ('a')
  // }
  // `,
  // `
  // {
  //   key: 'a'
  // }
  // `,
  // `
  // parse {
  //   rule1: str = ('a')
  //   rule2 = ('abc')
  // }
  // `,
  `
  [1] | map ?
  `,
  // `
  // [{age: 36}] | $[0].age
  // `,
];

testCases.forEach((tc) => {
  const match = g.match(tc, "Cmd");
  if (match.succeeded()) {
    console.log(semantics(match).eval());
  } else {
    console.log(match.message);
  }
});

// RL

const readline = require('readline');

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });

// rl.on('line', (input) => {
//   console.log(`Received: ${input}`);
// });
