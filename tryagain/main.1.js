/**
 * A different grammar (ADG)
 * Behaves like PEG, in that a choice is ordered and
 * commits to the first option if that proceduces a valid parse tree,
 * BUT does backtracking if a rule leads to a failing node (even deep).
 * 
 * Means that lookahead is not necessary (unlike PEG),
 * but produces unambiguous results (unlike BNF).
 * 
 * The intent is research.
 */
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


// e expression, v value, a alternative, k key, s *, p +
const rules = {
  "sue": {
    a: [
      { v: "a" },
      { v: "b" },
      { v: "c" },
      { v: "d" },
      { v: "e" },
      { v: "f" },
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
        p: true,
        e: [
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
        ],
      },
      { v: "}" },
    ],
  },
};

const exec = (rules, input) => (main) => {
  const trails = new BloomFilter(32 * 256, 16);
  let last_failed;
  const iti = (rule, cursor, id, trail) => {
    trails.add(trail.join(''));
    const token = input[cursor];
    if (rule.p) {
      let i = 0;
      const this_rule = { ...rule, p: undefined };
      let result = iti(this_rule, cursor, id, trail);
      if (!result.match) {
        return result;
      }
      let last_success;
      while (result.match) {
        i++;
        last_success = result;
        const sub_id = id + '+' + i;
        result = iti(this_rule, result.cursor, sub_id, result.trail.concat(sub_id));
      }
      return last_success;
    } else if (rule.e) {
      let result = {
        cursor,
        trail,
      };
      let complete = true;
      let i;
      for (i = 0; i < rule.e.length; i++) {
        const sub_id = `${id}[${i}]`;
        result = iti(rule.e[i], result.cursor, sub_id, result.trail.concat(sub_id));
        complete = result.complete && complete;
        if (!result.match) {
          break;
        }
      }
      if (result.match && i === rule.e.length) {
        return { ...result, complete };
      } else if (!complete) {
        return iti(rule, cursor, id, trail);
      }
      return { ...result, match: false };
    } else if (rule.r) {
      return iti(rules[rule.r], cursor, rule.r, trail);
    } else if (rule.a) {
      let i, visited = 0;
      for (i = 0; i < rule.a.length; i++) {
        const alt_rule = rule.a[i];
        const alt_trail = trail.concat(id + '(' + i + ')');
        const not_visited = trails.test(alt_trail.join('')) === false; // false if definitely not visited
        if (not_visited) {
          const result = iti(alt_rule, cursor, id, alt_trail);
          if (result.match) {
            return { ...result, complete: false };
          }
        } else {
          visited++;
        }
      }
      const complete = i === visited;
      return { match: false, cursor, complete, id, trail };
    } else if (rule.v) {
      const match = token === rule.v;
      if (match) {
        return { match, complete: true, cursor: cursor + 1, token, id, trail: trail.concat("match:'"+rule.v+"'") };
      }
      last_failed = { token, cursor, expected: rule.v };
      return { match: false, complete: true, cursor: cursor, token, id, trail: trail.concat("!match:'"+rule.v+"'") };
    }
    throw new Error(`Malformed rule: ${ JSON.stringify(rule) }`);
  };
  return { ...iti(rules[main], 0, main, []), last_failed };
};

const test = ([input, must_pass]) => {
  console.log(input);
  const result = exec(rules, input)("obj");
  if (must_pass) {
    if (!result.match) {
      console.log(`ERROR: got: '${  result.last_failed.token }' expected '${ result.last_failed.expected }'`);
      console.log(input);
      for (let i = 0; i < result.cursor; i++) {
        process.stdout.write(" ");
      }
      process.stdout.write("^");
      for (let i = result.cursor + 1; i < result.last_failed.cursor; i++) {
        process.stdout.write("-");
      }
      process.stdout.write("^\n");
    } else {
      console.log('SUCCESSFULLY PASSED\n');
    }
  } else {
    if (result.match) {
      console.log('ERROR: expected failure:', JSON.stringify(result, null, 2));
      console.log(input);
      for (let i = 0; i < result.cursor; i++) {
        process.stdout.write(" ");
      }
      process.stdout.write("^\n");
    } else {
      console.log('SUCCESSFULLY FAILED\n');
    }
  }
};

[
  // ['{a:b}', true],
  // ['{a:b,}', true],
  // ['{a:{b:c}}', true],
  // ['{a:{b:c},}', true],
  // ['{a:{b:c},},', true],
  // ['{:', false],
  // ['{a:', false],
  // ['{a:b,c:d}', true],
  ['{a:b,c:d,}', true],
  // ['{a:b,c:d,e:f,}', true],
].forEach(test);

// Plan:
// 1.  fix/add star, look-ahead, plus, not operators, slurps?
// 2.  find perfect hash for trails (dynamic length)
// 3.  find or verify bloom filter algorithm for dynamic length hash
// 4.  re-write to non-recursive
// 5.  create grammar of self so strings can be used to define a grammar
// 6.  research Ohm and implement a similar interface
// 7.  implement TAS grammar and test
// 8.  TAS typing: int, number, string, vector, (json) object, bool, unit, function, tuple
// 9.  cleanup, add tests, release on npm (closing js-adg project)
// 10. re-write to rust (rust-adg), make tests work, ...
// 11. write std lib for TAS in rust: foldl, parse, req, swap, let. Then: map, reduce, min, max, head, tail, drop, regex, ...
// 12. create benchmark suite, hack to acceptable performance level
// 13. interpreter for TAS with auto-complete, cd, ll, ...
// 14. verify TASitc feasability: versioning, environments, ...?
// 15. deploy first alpha of TAS on nix, harvest comments
// 16. deploy alpha of TAS on redox, harvest comments
// 17. deploy TASitc, harvest comments
