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
        star: true,
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

// const input = "{a:{b:c},{d:e,f:g}}}";
const input = "{c:d,a:b}";

const exec = (rules, input) => (start) => {
  const trails = new BloomFilter(32 * 256, 16);

  const iti = (rule, cursor, id, trail) => {
    trails.add(trail.join(''));
    const token = input[cursor];
    if (rule.e) {
      let next_result = { cursor, id, complete: true, trail: trail.concat(id + '[' + '0' + ']') };
      let i = 0;
      for (const then_rule of rule.e) {
        next_result = iti(then_rule, next_result.cursor, id + '[' + i + ']', next_result.trail);
        if (!next_result.match) {
          break;
        }
        i++;
      }
      if (!next_result.match && !next_result.complete) {
        return iti(rule, cursor, id, trail);
      } else if (rule.star) {
        const star_trail = (next_result.match ? next_result.trail : trail).concat(id + '[*]');
        const not_visited = trails.test(star_trail.join('')) === false; // false if definitely not visited
        if (not_visited) {
          const star_result = iti(rule, next_result.cursor, id + '[*]', star_trail);
          if (star_result.match) {
            console.log('here', star_result);
            return star_result;
          }
        }
      }
      return next_result;
    } else if (rule.r) {
      return iti(rules[rule.r], cursor, rule.r, trail);
    } else if (rule.a) {
      let i = 0;
      for (const alt_rule of rule.a) {
        const alt_trail = trail.concat(id + '(' + i + ')');
        const not_visited = trails.test(alt_trail.join('')) === false; // false if definitely not visited
        if (not_visited) {
          const result = iti(alt_rule, cursor, id, alt_trail);
          if (result.match) {
            return { ...result, complete: false };
          }
        }
        i++;
      }
      return { match: false, cursor, complete: true, id, trail };
    } else if (rule.v) {
      const match = token === rule.v;
      return { match, cursor: cursor + 1, token, id, trail: trail.concat("token:'"+token+"'") };
    }
    throw new Error(`Malformed rule: ${ JSON.stringify(rule) }`);
  };
  return iti(rules[start], 0, start, []);
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
