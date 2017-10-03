const ints = {
  0: 'Int',
  1: 'Int',
  2: 'Int',
  3: 'Int',
  4: 'Int',
  5: 'Int',
  6: 'Int',
  7: 'Int',
  8: 'Int',
  9: 'Int',
}

const symbols = {
  ...ints,
  '\n': 'New', // \n
  '#': 'Hax', // #
  '|': 'Bar', // |
  '.': 'Dot', // .
  ',': 'Com', // ,
  '$': 'Ctx', // $
  ':': 'Col', // :
  '[': 'Sel', // [
  ']': 'Ser', // ]
  '{': 'Kel', // {
  '}': 'Ker', // }
  '(': 'Pal', // (
  ')': 'Par', // )
  '<': 'Gal', // <
  '>': 'Gar', // >
  '*': 'Tar', // *
  '"': 'Doq', // "
  '\'': 'Soq', // '
  '~': 'Sig', // ~
  '=': 'Tis', // =
  '?': 'Wut', // ?
  '\\': 'Bas', // \
  '/': 'Fas', // /
  '-': 'Hep', // -
  '+': 'Lus', // +
  ' ': 'Ace', // <space>
}

const tokenize = (input) => {
  return input.split('').reduce((prev, curr, idx) => {
    const token_type = symbols[curr] || 'Sue';
    const last = prev.slice(-1)[0];
    const isSlurp = (slurp) => (last && last.token_type === slurp) && token_type === slurp;
    if (isSlurp('Sue') || isSlurp('Ace')) {
      const last = prev.pop();
      return prev.concat({
        ...last,
        content: (last.content || '') + curr,
        pos: {
          ...last.pos,
          end: idx,
        },
      });
    } else if (
      (last && last.token_type === 'Int' && token_type === 'Dot') ||
      (last && last.token_type === 'Num' && token_type === 'Int')
    ) {
      const last = prev.pop();
      return prev.concat({
        ...last,
        token_type: 'Num',
        content: last.content + curr,
        pos: {
          ...last.pos,
          end: idx,
        },
      });
    } else if (token_type === 'Soq' && last.scan !== 'Soq') {
      return prev.concat({
        token_type: 'Soq',
        content: '',
        pos: idx,
        scan: 'Soq',
        pos: {
          ...last.pos,
          end: idx,
        },
      });
    } else if (last && last.scan === 'Soq' && token_type === 'Soq') {
      const last = prev.pop();
      return prev.concat({
        token_type: 'Soq',
        content: last.content,
        pos: {
          ...last.pos,
          end: idx,
        },
      });
    } else if (last && last.token_type === 'Soq' && last.scan === 'Soq') {
      const last = prev.pop();
      return prev.concat({
        ...last,
        token_type: 'Soq',
        content: last.content + curr,
        pos: {
          ...last.pos,
          end: idx,
        },
      });
    } else if (token_type === 'Ace') {
      return prev;
    }
    return prev.concat({
      token_type,
      content: curr,
      pos: {
        start: idx,
        end: idx,
      },
    });
  }, []);
};

module.exports = {
  tokenize,
};