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
    a: [
      { v: "a" },
      { v: "b" },
      { v: "c" },
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
      {
        k: "rhs",
        a: [
          { r: "sue" },
          { r: "obj" },
        ],
      },
    ],
  },
  "obj": {
    intransitive: true,
    e: [
      { v: "{" },
      { r: "obj_val" },
      // {
      //   star: true,
      //   a: [
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
const input = "{a:{b:c}}";

const compute_match = (token, pos, rule_input, rules, stack) => {
  let rule = rule_input;
  let id = pos.id;
  let k = pos.k;
  while (!rule.v && !rule.a) {
    const i = rule.i || 0;
    if (rule.e) {
      rule = { ...rule.e[i] };
    } else if (rule.r) {
      rule = { ...rules[rule.r], id: rule.r };
    } else if (rule.a) {
      rule = { ...rules.a };
    } else {
      console.error('Unknown rule', rule);
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

  const found_match = (token === rule.v) || rule.a && !!(rule.a.find((alt) => {
    const branch_stack = [];
    const found_match = compute_match(token, pos, alt, rules, branch_stack);
    if (found_match.match) {
      stack.push(...branch_stack);
      k = found_match.k;
      id = found_match.id;
      rule = found_match.rule;
      return true;
    }
  }));

  return { id, k, rule, match: found_match };
};

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

    const result = compute_match(token, pos, rule, rules, stack);
    const { id, k, match } = result;
    rule = result.rule;
    
    if (rule.v || rule.a) {
      if (match) {
        if (!pos.e) {
          console.error('ERROR: unexpected rule position', pos);
          break;
        } else {
          console.log(id, k || 'value', token);
        }
      } else {
        console.error(`ERROR: got: '${ token }' at ${ i } expected: ${ rule.v || JSON.stringify(rule.a) } `, JSON.stringify(stack));
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
  if (stack.length || input.length !== i) {
    console.error(`ERROR: Unexpected character at ${ i }`);
  }
  console.log(nodes);
  console.log({
    id: 'obj',
    values: [
      {
        id: 'obj_val',
        lhs: {
          value: 'a',
        },
        rhs: {
          id: 'obj',
          values: [
            {
              id: 'obj_val',
              lhs: {
                value: 'b',
              },
              rhs: {
                value: 'c',
              },
            },
          ],
        },
      },
    ],
  });
};

exec(rules, input);


