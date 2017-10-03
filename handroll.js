
// 1.0 | [{foo: {a: 'b', c: [1.0, ($ + 2 | $ - 1)] }, bar: 5}] | map (? | $.foo.c[1]) # 2.0

// { foo: { v: 1, v: 2 }, bar: 3 } | { ...foo }
// { ...foo, bar: ./zoo }
// {foo: 1, bar: 2} | { foo }
// { foo, bar: ./zoo }
const data = () => {
  // 1.0 | [{foo: {a: 'b', c: [1.0, ($ + 2 | $ - 1)] }, bar: 5}] | map (? | $.foo.c[1]) # 2.0
  const tokens = [
    { token_type: "New", content: "" },
    { token_type: "Num", content: "1.0" },
    { token_type: "Ace", content: " " },
    { token_type: "Bar", content: "" },
    { token_type: "Ace", content: " " },
    { token_type: "Sel", content: "" },
    { token_type: "Kel", content: "" },
    { token_type: "Sue", content: "foo" },
    { token_type: "Col", content: "" },
    { token_type: "Ace", content: " " },
    { token_type: "Kel", content: "" },
    { token_type: "Sue", content: "a" },
    { token_type: "Col", content: "" },
    { token_type: "Ace", content: " " },
    { token_type: "Soq", content: "b" },
    { token_type: "Com", content: "" },
    { token_type: "Ace", content: " " },
    { token_type: "Sue", content: "c" },
    { token_type: "Col", content: "" },
    { token_type: "Ace", content: " " },
    { token_type: "Sel", content: "" },
    { token_type: "Num", content: "1.0" },
    { token_type: "Com", content: "" },
    { token_type: "Ace", content: " " },
    { token_type: "Pal", content: "" },
    { token_type: "Ctx", content: "" },
    { token_type: "Ace", content: " " },
    { token_type: "Lus", content: "" },
    { token_type: "Ace", content: " " },
    { token_type: "Int", content: "2" },
    { token_type: "Ace", content: " " },
    { token_type: "Bar", content: "" },
    { token_type: "Ace", content: " " },
    { token_type: "Ctx", content: "" },
    { token_type: "Ace", content: " " },
    { token_type: "Hep", content: "" },
    { token_type: "Ace", content: " " },
    { token_type: "Int", content: "1" },
    { token_type: "Par", content: "" },
    { token_type: "Ser", content: "" },
    { token_type: "Ace", content: " " },
    { token_type: "Ker", content: "" },
    { token_type: "Com", content: "" },
    { token_type: "Ace", content: " " },
    { token_type: "Sue", content: "bar" },
    { token_type: "Col", content: "" },
    { token_type: "Ace", content: " " },
    { token_type: "Int", content: "5" },
    { token_type: "Ker", content: "" },
    { token_type: "Ser", content: "" },
    { token_type: "Ace", content: " " },
    { token_type: "Bar", content: "" },
    { token_type: "Ace", content: " " },
    { token_type: "Sue", content: "map" },
    { token_type: "Ace", content: " " },
    { token_type: "Pal", content: "" },
    { token_type: "Wut", content: "" },
    { token_type: "Ace", content: " " },
    { token_type: "Bar", content: "" },
    { token_type: "Ace", content: " " },
    { token_type: "Ctx", content: "" },
    { token_type: "Dot", content: "" },
    { token_type: "Sue", content: "foo.c" },
    { token_type: "Sel", content: "" },
    { token_type: "Int", content: "1" },
    { token_type: "Ser", content: "" },
    { token_type: "Par", content: "" },
    { token_type: "Ace", content: " " },
    { token_type: "Hax", content: "# 2.0" },
    { token_type: "New", content: "" },
  ];

  const expected = [
    {
      kind: 'obj',
      contains: [
        {
          path: 'foo',
          kind: 'obj',
          contains: [
            {
              path: 'bar',
              kind: 'str',
              value: 'zoo',
            },
          ],
        },
      ],
    },
  ];

  return { tokens, expected };
};


const { tokens, expected } = data();

// const buildObj = (tokens, curr, last) => {
//   const head = tokens[0];
//   if (head && head.token_type === 'Kel') {
//     return buildObj(tokens.slice(1), {});
//   } else if (head && curr && head.token_type === 'Sue') {
//     const contains = (curr.contains || [])
//       .concat({ path: head.content });
//     return buildObj(tokens.slice(1), { ...curr, contains });
//   } else if (curr) {
//     return curr;
//   }
//   return null;
// };

/*
  { token_type: 'New', content: '' },
  { token_type: 'Kel', content: '' },
  { token_type: 'Sue', content: 'foo' }, 
  { token_type: 'Col', content: '' },
  { token_type: 'Kel', content: '' },
  { token_type: 'Sue', content: 'bar' },
  { token_type: 'Col', content: '' },
  { token_type: 'Soq', content: 'zoo' },
  { token_type: 'Ker', content: '' },
  { token_type: 'Ker', content: '' },
*/

let result = [];
let stack = [];

tokens.forEach((token) => {
  const last = stack.slice(-1)[0];
  const lastContains = last && last.contains.slice(-1)[0];
  if (token.token_type === 'Kel') {
    stack.push({ kind: 'obj', contains: [] });
  } else if (token.token_type === 'Ker') {
    const stack_frame = stack.pop();
    if (stack.length === 0) {
      result.push(stack_frame);
    } else {
      const newLast = stack.slice(-1)[0];
      newLast.contains.push(Object.assign(newLast.contains.pop(), stack_frame));
    }
  } else if (token.token_type === 'Sue') {
    last.contains.push({ path: token.content });
  } else if (token.token_type === 'Soq') {
    lastContains.kind = 'str';
    lastContains.value = token.content;
  }
});

// const result = tokens.reduce((prev, curr) => {
//   const { stack, last } = prev;

//   if (curr.token_type === 'New') {
//     return {
//       stack,
//       last: {},
//     };
//   } else if (curr.token_type === 'Kel') {
//     last.kind = 'obj';
//     last.contains = [];
//   } else if (curr.token_type === 'Sue') {
//     last.contains.push({
//       path: curr.content,
//     });
//   } else if (curr.token_type === 'Col') {
//     return {
//       stack: stack.concat(last),
//       last: {},
//     };
//   } else if (curr.token_type === 'Soq') {
//     last.kind = 'str';
//     last.value = curr.content;
//   } else if (curr.token_type === 'Ker') {
//     return {
//       stack: stack.concat(last),
//       last: {},
//     };
//   }

//   return prev;
// }, { last: undefined, stack: [] });

// const result = buildObj(tokens);
// console.log(JSON.stringify(tokens, null, 2));
console.log(JSON.stringify(result, null, 2));
// console.log(JSON.stringify(result, null, 2) === JSON.stringify(expected, null, 2))
// console.log(JSON.stringify(expected, null, 2));

