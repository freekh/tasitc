

const data = () => {
  // {foo:{bar:'zoo'}}
  const tokens = [
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

