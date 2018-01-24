const fs = require('fs');
const ohm = require('ohm-js');
const assert = require('chai').assert;

const contents = fs.readFileSync('tas.ohm');
const g = ohm.grammar(contents);

const asFunction = (i) => {
  if (typeof i === 'function') {
    return i;
  }
  return () => i;
};

const core = {
  "map": (a) => {
    return (C) => {
      return C.map(a);
    }
  },
};

const initCtx = {
  cwd: __dirname,
};

let globals = {}; // obviously a huge hack!

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
  Expr: function(e, _, _) {
    return e.eval();
  },
  CmdExpr: function(cmdSematics, _, args) {
    const cmd = cmdSematics.eval();
    const cmdImpl = core[cmd];
    if (cmdImpl) {
      return cmdImpl(...args.eval());
    }
    return _ => {
      const value = globals[cmd];
      if (value) {
        return value;
      }
      throw new Error(cmd + " not implemented");
    }
  },
  ObjLiteral: function(_, first, _, pairs, _, _) {
    const [ f ] = first.eval();
    const [ p ] = pairs.eval();
    const res = {};
    if (f && f[0]) {
      res[f[0]] = f[1];
    }
    if (p && p.length) {
      for (const pa of p) {
        res[pa[0]] = pa[1];
      }
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
    if (f !== undefined) {
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
  ValueExpr: function(valueS, subscriptsS) {
    const value = valueS.eval();
    const subscripts = subscriptsS.eval();
    return (_) => {
      const Q = globals[value];
      if (!subscripts.length) {
        return Q;
      }
      return subscripts.reduce((prev, curr) => {
        return curr(prev);
      }, Q);
    };
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
  Let: function(_, key, _, val) {
    globals[key.eval()] = val.eval();
    return (Q) => {
      return Q;
    };
  },
  decimalDigit: function(_) {
    return parseInt(this.sourceString, 10);
  },
});

const typecheckSemantics = g.createSemantics().addOperation('check', {
  TypeExpr: function(f, t) {
    return [f.check()].concat(t.check()).join("");
  },
  NonemptyListOf: function(head, _, tail) {
    console.log(tail.check());
    return head.check();
  },
  CmdId: function(first, chars) {
    return first.check() + chars.check().join("");
  },
  Expr: function(e, _, t) {
    console.log(e.check(), "type", t.check());
    return e.check();
  },
  CmdExpr: function(cmdSematics, _, args) {
    console.log(cmdSematics.check());
  },
  ObjLiteral: function(_, first, _, pairs, _, _) {
  },
  ObjPair: function( key, _, val) {
  },
  KeyPath: function(_, a, b, _) {
  },
  _terminal: function() {
  },
  FunExpr: function(e, subscriptsS) {
    console.log('!', e.check());
  },
  Val: function(_, val, _) {
    return val.check();
  },
  ArrayLiteral: function(_, first, _, pairs, _, _) {
    return { provides: "vec" };
  },
  Int: function(_) {
    return { provides: "int" };
  },
  ValueExpr: function(valueS, subscriptsS) {
  },
  CtxExpr: function(_, subscriptsS) {
  },
  ArraySubscript: function(_, iS, _) {
  },
  PropSubScript: function(_, keyS) {
  },
  Let: function(_, key, _, val) {
  },
  decimalDigit: function(_) {
  },
});

const testCases = [
  // [`0`, 0, { provides: 'int' }],
  // [`0: int`, 0, { provides: 'int' }],
  [`0 | map ?`, 0, { error: true, context: { provided: [ { type: 'int' }], required: [ { type: 'vec' }] } }],
  // [`[1,2]`, [ 1, 2 ], 'int[]'],
  [`[1,2 ] | map ?
  `, [ 1, 2 ]],
  [`[1,2]
  map ?
  `, [ 1, 2 ]],
  [`[{ age: 36} ]`, [ { age: 36} ] ],
  [`[{age: 36}] | $[0].age
  `, 36],
  [`[{age:36}]
   $[0].age`, 36],
  [`[{age:36}] |
   $[0].age`, 36],
  [`[{age: 36}] | $[0]
  `, { age: 36 }],
  [`[{age: 36}] | $[0]
  `, { age: 36 }],
  [`[{age: 36}] | map ?.age
  `, [ 36 ]],
  [`[{age: 36}, { age: 12 }] | map ?.age
  `, [ 36, 12 ]],
  [`[[0, 2]] | map ?[0]
  `,[0]],
  [`let test = 1
  test`, 1],
  [`let test = [{age: 36 }]
   test[0]`, { age: 36 }],
  [`let test = [{age: 36 }]
  test | $[0].age`, 36 ],
  // `
  // (
  //   let fun = ?
  //   [{age:36,age2:123},{age:12}] | map ?[fun]
  // ) age
  // `,
];

testCases.forEach(([tc, exp, expType]) => {
  globals = {};
  const input = tc.trim();
  const match = g.match(input, "Cmd");
  if (match.succeeded()) {
    if (expType) {
      assert.deepEqual(typecheckSemantics(match).check(), expType, "Typecheck failed for:" + JSON.stringify(input));
    }
    assert.deepEqual(semantics(match).eval(), exp, "Failed at: " + JSON.stringify(input));
  } else {
    // console.log(g.trace(input, "Cmd").toString());
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
// let all = ''
// rl.on('line', (input) => {
//   all += input + '\n';
//   if (!input && all.trim()) {
//     const match = g.match(all.trim(), "Cmd");
//     if (match.succeeded()) {
//       try {
//         console.log(semantics(match).eval());
//       } catch (err) {
//         console.error("\x1b[31m" + err.message + "\x1b[0m");
//       }
//     } else {
//       console.error("\x1b[31m" + match.message + "\x1b[0m");
//     }
//     rl.prompt();
//     all = '';
//   }
// });
