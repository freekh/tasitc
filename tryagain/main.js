const fs = require('fs');
const { parse } = require('./parser');

// Hack
const stdin = fs.readFileSync(0).toString();

// console.log(stdin);
// console.log(JSON.stringify(parse(stdin), null, 1));

// sue:     ("a" <|> "b" <|> "c" <|> "d" <|> "e" <|> "f" <|> "g")
// obj_val: (sue <&> ":" <&> (sue <|> obj))
// obj:     ("{" <&> (obj_val <|> (obj_val <&> ","))* <&> "}")

const rules = {
  "sue": {
    mark: true,
    e: [
      { v: "a" },
      { v: "b" },
      { v: "c" },
      { v: "d" },
      { v: "e" },
      { v: "f" },
      { v: "g" },
    ],
  },
  "obj_val": {
    e: [
      { r: "sue" },
      { v: ":" },
      {
        mark: true,
        e: [
          { r: "sue" },
          { r: "obj" },
        ],
      },
    ],
  },
  "obj": {
    e: [
      { v: "}" },
      {
        star: true,
        mark: true,
        e: [
          { r: "obj_val" },
          {
            e: [
              { r: "obj_val" },
              { v: "," },
            ],
          },
        ]
      },
      { v: "}" },
    ],
  },
};

"{a:{b:c},{d:e,f:g}}}"