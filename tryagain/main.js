const fs = require('fs');
const { parse } = require('./parser');
const { BloomFilter } = require('bloomfilter');

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
      { v: "d" },
      // { v: "e" },
      // { v: "f" },
      // { v: "g" },
    ],
  },
  "obj_val": {
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
    e: [
      { v: "{" },
      {
        a: [
          { r: "obj_val" },
          {
            e: [
              { r: "obj_val" },
              { v: "," },
            ],
          },
        ],
      },
      { v: "}" },
    ],
  },
};

// const input = "{a:{b:c},{d:e,f:g}}}";
const input = "{a:b,}";

const exec = (rules, input) => (start) => {
  const trails = new BloomFilter(32 * 256, 16);

  const iti = (rule, cursor, id, trail, complete) => {
    trails.add(trail.join(''));
    const token = input[cursor];
    if (rule.e) {
      let next_result = { cursor, id, trail: trail.concat(id + '[' + '0' + ']') };
      let i = 0;
      for (const then_rule of rule.e) {
        next_result = iti(then_rule, next_result.cursor, id + '[' + i + ']', next_result.trail, complete);
        if (!next_result.match) {
          break;
        }
        i++;
      }
      if (!next_result.match && !next_result.complete) {
        return iti(rule, cursor, id, trail, complete);
      } else {
        return next_result;
      }
    } else if (rule.r) {
      return iti(rules[rule.r], cursor, rule.r, trail);
    } else if (rule.a) {
      let i = 0;
      let skipped = 0;
      for (const alt_rule of rule.a) {
        const alt_trail = trail.concat(id + '(' + i + ')');
        const not_visited = trails.test(alt_trail.join('')) === false; // false if definitely not visited
        if (not_visited) {
          const result = iti(alt_rule, cursor, id, alt_trail, complete);
          if (result.match) {
            return result;
          }
        } else {
          skipped++;
        }
        i++;
      }
      return { match: false, cursor, complete: skipped === rule.a.length && complete, id, trail };
    } else if (rule.v) {
      const match = token === rule.v;
      return { match, cursor: cursor + 1, token, id, trail: trail.concat("token:'"+token+"'") };
    }
    throw new Error(`Malformed rule: ${ JSON.stringify(rule) }`);
  };
  return iti(rules[start], 0, start, [], false);
};

const result = exec(rules, input)("obj");
if (!result.match) {
  console.log('ERROR: unexpected token', JSON.stringify(result, null, 2));
  console.log(input);
  for (let i = 0; i < result.cursor; i++) {
    process.stdout.write(" ");
  }
  process.stdout.write("^\n");
} else {
  console.log(JSON.stringify(result, null, 2));
}


