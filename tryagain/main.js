const fs = require('fs');
const { parse } = require('./parser');

// Hack
// const stdin = fs.readFileSync(0).toString();

// console.log(stdin);
// console.log(JSON.stringify(parse(stdin), null, 1));

// sue:     ("a" <|> "b" <|> "c" <|> "d" <|> "e" <|> "f" <|> "g")
// obj_val: (sue=lhs <&> ":" <&> (sue <|> obj)=rhs)
// obj:     ("{" <&> (obj_val <|> (obj_val <&> ","))* <&> "}")

const rules = {
  "sue": {
    // mark: true,
    e: [
      { v: "a" },
      // { v: "b" },
      // { v: "c" },
      // { v: "d" },
      // { v: "e" },
      // { v: "f" },
      // { v: "g" },
    ],
  },
  "obj_val": {
    intransitive: true,
    e: [
      { r: "sue", k: "lhs" },
      { v: ":" },
      { r: "sue", k: "rhs" },
      // {
      //   mark: true,
      //   e: [
      //     { r: "sue" },
          // { r: "obj" },
      //   ],
      // },
    ],
  },
  "obj": {
    intransitive: true,
    e: [
      { v: "{" },
      { r: "obj_val" },
      // {
      //   star: true,
      //   mark: true,
      //   e: [
      //     { r: "obj_val" },
      //     {
      //       e: [
      //         { r: "obj_val" },
      //         { v: "," },
      //       ],
      //     },
      //   ]
      // },
      { v: "}" },
    ],
  },
};

// const input = "{a:{b:c},{d:e,f:g}}}";
const input = "{a:a}";

const exec = (rules, input) => {
  const stack = [{ e: rules.obj.e, i: 0, id: 'obj' }];
  const nodes = { };
  
  let i = 0;
  while (stack.length && i < input.length) {
    const token = input[i];
    let pos = stack.pop();
    stack.push(pos);
    
    let rule;
    if (pos.e) {
      const i = pos.i || 0;
      rule = { e: pos.e, i };
    } else if (pos.v) {
      rule = { v: pos.v };
    } else if (pos.r) {
      rule = { r: pos.r };
    } else {
      console.error(`ERROR: '${ token }' at ${ JSON.stringify(pos) }`, JSON.stringify(stack, null, 2));
      break;
    }

    let id = pos.id;
    let k = pos.k;
    while (!rule.v) {
      const i = rule.i || 0;
      if (rule.e) {
        rule = { ...rule.e[i] };
      } else if (rule.r) {
        rule = { ...rules[rule.r], id: rule.r };
      } else {
        break;
      }
      if (rule.e) {
        stack.push({ ...rule, i });
      } else if (rule.r) {
        stack.push(rule);
      }
      // capture id
      if ((rule.r || rule.id) && rule.intransitive) {
        id = rule.r || rule.id;
      }
      // capture k
      if (rule.k) {
        k = rule.k;
      }
    }
    
    if (rule.v) {
      const match = token === rule.v;
      if (match) {
        if (!pos.e) {
          console.error('ERROR: unexpected rule position', pos);
          break;
        } else {
          console.log(id, k || 'value', token);
        }
      } else {
        console.error(`ERROR: got: '${ token }' at ${ i } expected: ${ rule.v } `, JSON.stringify(stack));
        break;
      }

      let next = stack.pop();
      while (next && (
          !next.e || // not e
          (next.e && (next.i + 1) === next.e.length) // end of e
        )
      ) {
        next = stack.pop();
      }
      if (next) {
        next.i = next.i + 1;
        stack.push(next);
      }
    } else {
      console.error('No rule here', JSON.stringify(stack));
      break;
    }
    i++;
  }
  console.log(nodes);
  console.log({
    kind: 'obj',
    values: [
      {
        kind: 'obj_val',
        lhs: {
          value: 'a',
        },
        rhs: {
          value: 'a',
        },
      },
    ],
  });
};

exec(rules, input);


