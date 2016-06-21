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

module.exports = (parseTree) => {
  const text = parseTree.text;
  const elems = [];
  if (parseTree.status === false) {
    let indents = '';
    let column = 0;
    let line = 1;
    for (let i = 0; i < parseTree.index; i++) {
      if (text[i] === '\n') {
        indents = '';
        column = 0;
        line += 1;
      } else {
        indents += '~';
        column += 1;
      }
    }
    elems.push(h('div', h('pre', { style: { color: 'red' } }, `FAILURE: line: ${line}, column: ${column}`)));
    elems.push(h('div', h('pre', `${text.split('\n').slice(line - 3 > 0 ? line - 3 : 0, line).join('\n ')}`)));
    elems.push(h('div', h('pre', { style: { color: 'red' } }, `${indents.slice(1)}^`))); // TODO: proper css
    const context = text
            .split('\n')
            .slice(line, line + 3 <= text.length ? line + 3 : text.length)
            .join('\n');
    elems.push(h('div', h('pre', `${context}`)));
    const expected = uniq(parseTree.expected).join(' or ');
    const actual = text[parseTree.index] ? text[parseTree.index].replace('\n', '\\n') : 'EOF';
    elems.push(h('div', h('pre', `Got: '${actual}'. Expected: ${expected}\n`)));
    return elems;
  }
  return [];
};
