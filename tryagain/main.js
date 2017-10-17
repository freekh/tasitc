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
  let stack = [{ e: rules.obj.e, i: 0 }];
  let i = 0;

  while (stack.length) {
    const token = input[i];

    let pos = stack.pop();
    while (pos.e && pos.i === pos.e.length - 1) {
      pos = stack.pop();
    }

    let rule;
    if (pos.e) {
      rule = pos.e[pos.i || 0];
    } else if (pos.v) {
      rule = { ...pos.v };
    } else if (pos.r) {
      rule = { ...pos.r };
    }

    if (pos.e) {
      pos.i = (pos.i || 0) + 1;
    }
    i++;
  }
};

exec(rules, input);
