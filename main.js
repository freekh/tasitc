const fs = require('fs');
const ohm = require('ohm-js');

const contents = fs.readFileSync('tas.ohm');
const g = ohm.grammar(contents);

const asFunction = (i) => {
  if (typeof i === 'function') {
    return i;
  }
  return () => i;
}

const core = {
  "map": (a) => {
    return (C) => {
      return C.map(a);
    }
  },
}

const initCtx = {
  cwd: __dirname,
};

const semantics = g.createSemantics().addOperation('eval', {
  NonemptyListOf: function(head, _, tail) {
    return tail.eval().reduce((prev, curr) => {
      const f = asFunction(curr);
      return f(prev);
    }, asFunction(head.eval())(initCtx));
  },
  CmdId: function(first, chars) {
    return first.eval() + chars.eval().join("");
  },
  CmdExpr: function(cmdSematics, _, args) {
    const cmd = cmdSematics.eval();
    const cmdImpl = core[cmd];
    if (cmdImpl) {
      return cmdImpl(...args.eval());
    }
    throw new Error(cmd + " not implemented");
  },
  ObjLiteral: function(_, first, _, pairs, _, _) {
    const [ f ] = first.eval();
    const [ p ] = pairs.eval();
    const res = {};
    if (f && f[0]) {
      res[f[0]] = f[1];
    }
    for (const pa of p) {
      res[pa[0]] = pa[1];
    }
    return res;
  },
  ObjPair: function( key, _, val) {
    return [key.eval(), val.eval()];
  },
  KeyPath: function(_, a, b, _) {
    return [a.eval()].concat(b.eval()).join("");
  },
  _terminal: function() {
    return this.sourceString;
  },
  FunExpr: function(e, subscriptsS) {
    const subscripts = subscriptsS.eval();
    return (Q) => {
      if (!subscripts.length) {
        return Q;
      }
      return subscripts.reduce((prev, curr) => {
        return curr(prev);
      }, Q);
    };
  },
  Val: function(_, val, _) {
    return val.eval();
  },
  ArrayLiteral: function(_, first, _, pairs, _, _) {
    const [ f ] = first.eval();
    const [ p ] = pairs.eval();
    const res = [];
    if (f) {
      res.push(f);
    }
    for (const pa of p) {
      res.push(pa);
    }
    return res;
  },
  Int_positive: function(_, v) {
    return parseInt(v.eval().join(""));
  },
  Int_negative: function(_, v) {
    return -parseInt(v.eval().join(""), 10);
  },
  Int_noSign: function(v) {
    return parseInt(v.eval().join(""), 10);
  },
  CtxExpr: function(_, subscriptsS) {
    const subscripts = subscriptsS.eval();
    return (Q) => {
      if (!subscripts.length) {
        return Q;
      }
      return subscripts.reduce((prev, curr) => {
        return curr(prev);
      }, Q);
    };
  },
  ArraySubscript: function(_, iS, _) {
    const i = iS.eval();
    return (v) => {
      return v[i];
    };
  },
  PropSubScript: function(_, keyS) {
    const key = keyS.eval();
    return (v) => {
      return v[key];
    };
  },
  decimalDigit: function(_) {
    return parseInt(this.sourceString, 10);
  },
});

const testCases = [
  `[1,2] | map ?
  `,
  `[1,2]
  map ?
  `,
  `[{ age: 36} ]`,
  `[{age: 36}] | $[0].age
  `,
  `[{age:36}]
  $[0].age`,
  `[{age:36}] |
  $[0].age`,
  `[{age: 36}] | $[0]
  `,
  `[{age: 36}] | $[0]
  `,
  `[{age: 36}] | map ?.age
  `,
  `[{age: 36}, { age: 12 }] | map ?.age
  `,
  // `
  // (
  //   let fun = ?
  //   [{age:36,age2:123},{age:12}] | map ?[fun]
  // ) age
  // `,
];

// const test = () => {
//   const contents = fs.readFileSync('test.ohm');
//   const g = ohm.grammar(contents);

//   testCases.forEach((tc) => {
//     const match = g.match(tc, "Cmd");
//     console.log(JSON.stringify(tc));
//     if (match.succeeded()) {
//       console.log('YEAH');
//       // console.log(semantics(match).eval());
//     } else {
//       console.log(match.message);
//     }
//   });
// };
// test();

testCases.forEach((tc) => {
  const input = tc.trim();
  const match = g.match(input, "Cmd");
  console.log(JSON.stringify(input));
  if (match.succeeded()) {
    console.log(semantics(match).eval());
  } else {
    console.log(match.message);
  }
});

// RL

// const readline = require('readline');

// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });
// const ps1 = '> ';
// rl.setPrompt(ps1);

// console.log("Welcome to tas - v0.0.1");
// rl.prompt();
// rl.on('line', (input) => {
//   if (input) {
//     const match = g.match(input, "Cmd");
//     if (match.succeeded()) {
//       try {
//         console.log(semantics(match).eval());
//       } catch (err) {
//         console.error("\x1b[31m" + err.message + "\x1b[0m");
//       }
//     } else {
//       console.error("\x1b[31m" + match.message + "\x1b[0m");
//     }
//   }
//   rl.prompt();
// });
