const h = require('hyperscript');

const uniq = array => { // TODO: go through this, its pasted in from somewhere (dumbass)
  const seen = {};
  const out = [];
  let j = 0;
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    if (seen[item] !== 1) {
      seen[item] = 1;
      out[j++] = item;
    }
  }
  return out;
};

module.exports = (expr, result) => {
  const elems = [];
  if (result.status === false) {
    let indents = '';
    let column = 0;
    let line = 1;
    for (let i = 0; i < result.index; i++) {
      if (expr[i] === '\n') {
        indents = '';
        column = 0;
        line += 1;
      } else {
        indents += '~';
        column += 1;
      }
    }
    elems.push(h('div', h('pre', `FAILURE: line: ${line}, column: ${column}`)));
    elems.push(h('div', h('pre', `${expr.split('\n').slice(line - 3 > 0 ? line - 3 : 0, line).join('\n ')}`)));
    elems.push(h('div', h('pre', `${indents}^`)));
    const context = expr
            .split('\n')
            .slice(line, line + 3 <= expr.length ? line + 3 : expr.length)
            .join('\n');
    elems.push(h('div', h('pre', `${context}`)));
    const expected = uniq(result.expected).join(' or ');
    const actual = expr[result.index] ? expr[result.index].replace('\n', '\\n') : 'EOF';
    elems.push(h('div', h('pre', `Got: '${actual}'. Expected: ${expected}\n`)));
    return elems;
  }
  return [];
};
