const fs = require('fs');
const { parse } = require('./parser');

// Hack
// const stdin = fs.readFileSync(0).toString();

// console.log(stdin);
// console.log(JSON.stringify(parse(stdin), null, 1));

// sue:     ("a" <|> "b" <|> "c" <|> "d" <|> "e" <|> "f" <|> "g")
// obj_val: (sue <&> ":" <&> (sue <|> obj))
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
    e: [
      { r: "sue" },
      { v: ":" },
      { r: "sue" },
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
  let i = 0;
  let curr_rule = { ...rules.obj };
  const stack = [];
  const marks = [];
  while (i < input.length) {
    const token = input[i];

    while (curr_rule.e || curr_rule.r) {
      stack.push(curr_rule);
      if (curr_rule.r) {
        curr_rule = { ...rules[curr_rule.r] };
      } else if (curr_rule.e[0]) {
        curr_rule = curr_rule.e[0]; 
      } else {
        curr_rule = undefined;
        break;
      }
    }

    
    if (!curr_rule || !curr_rule.v) {
      console.log('No rule here', token, JSON.stringify(stack, null, 2));
      break;
    } else if (curr_rule.v) {
      if (token === curr_rule.v) {
        i++;
        console.log('matched', token, curr_rule);
        if (stack[stack.length - 1] && stack[stack.length - 1].e) {
          stack[stack.length - 1] = { e: stack[stack.length - 1].e.slice(1) };
        }
        curr_rule = stack.pop();
        while (curr_rule.e && curr_rule.e.length === 0) {
          curr_rule = stack.pop();
        }
        console.log('next', JSON.stringify(stack, null, 2));
      } else {
        console.log();
        console.log(`ERROR: token: '${ token }' does not match ${ JSON.stringify(curr_rule) }. Stack: ${ JSON.stringify(stack) }`);
        console.log();
        console.log(input);
        for (let s = 0; s < i; s++) {
          process.stdout.write(" ");
        }
        process.stdout.write("^\n");
        break;
      }
    }
  }
};

// const match = (token, rule, rules) => {
//   if (rule.v) {
//     return rule.v === token;
//   } else if (rule.r) {
//     return match(token, rules[rule.r], rules);
//   } else if (rule.e[0]) {
//     return match(token, rule.e[0], rules);
//   }
//   return undefined;
// };

// const next_v = (rule, rules, stack, id) => {
//   if (rule.v) {
//     return rule;
//   } else if (rule.e.length === 0) {
//     return stack.pop();
//   } else {
//     stack.push(depth);
//     if (rule.r) {
//       return next_v(rules[rule.r], rules, stack, id);
//     }
//   }
//   return undefined;
// };

// const exec = (rules, input) => {
//   let i = 0;
//   let curr_rule;
//   const stack = [];
//   while (i < input.length) {
//     const token = input[i];
//     if (!curr_rule) {
//       let matched;
//       for (const rule_id of Object.keys(rules)) {
//         const rule = rules[rule_id];
//         matched = match(token, rule, rules) && rule;
//         if (matched) {
//           break;
//         }
//       }
//       console.log(matched);
//       if (matched) {
//         curr_rule = { e: matched.e.slice() };
//       }
//     } else {
//       const id = stack.slice(-1)[0];
//       curr_rule = next_v(curr_rule, rules, stack, id);
//       const id = stack.slice(-1)[0];
//     }


//     if (!match(token, curr_rule, rules)) {
//       console.log();
//       console.log(`ERROR: token: '${ token }' does not match ${ JSON.stringify(curr_rule) }. Stack: ${ JSON.stringify(stack)}`);
//       console.log();
//       console.log(input);
//       for (let s = 0; s < i; s++) {
//         process.stdout.write(" ");
//       }
//       process.stdout.write("^\n");
//       curr_rule = undefined;
//       break;

//     }
//     console.log(token, curr_rule);
//     i++;
//   }
// };

exec(rules, input);
