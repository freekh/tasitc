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

const error = (parseTree) => {
  const text = parseTree.text;
  const lines = [];
  lines.push('##############################');
  lines.push(text);
  lines.push('##############################');

  if (!parseTree.status) {
    lines.push(JSON.stringify(parseTree, null, 2));
  }
  if (parseTree.status === false) {
    let indents = ' ';
    const offset = parseTree.index.offset;
    const line = parseTree.index.line;
    for (let i = 0; i < offset; i++) {
      if (text[i] === '\n') {
        indents = '';
      } else {
        indents += '~';
      }
    }
    lines.push('\x1b[91m', `\nFAILURE: line: ${line}, offset: ${offset}\n`, '\x1b[0m');
    lines.push(` ${text.split('\n').slice(line - 3 > 0 ? line - 3 : 0, line).join('\n ')}`);
    lines.push('\x1b[91m', `${indents}^`, '\x1b[0m');
    const context = text
            .split('\n')
            .slice(line, line + 3 <= text.length ? line + 3 : text.length)
            .join('\n');
    lines.push(`${context}`);
    const expected = uniq(parseTree.expected).join(' or ');
    const actual = text.slice(parseTree.index.offset, parseTree.index.column) ? text.slice(parseTree.index.offset, parseTree.index.column).replace('\n', '\\n') : 'EOF';
    lines.push('\x1b[91m', `Got: '${actual}'. Expected: ${expected}\n`, '\x1b[0m');
    return lines;
  }
  return [];
};

module.exports = error;
