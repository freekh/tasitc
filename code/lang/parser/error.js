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
    lines.push('\x1b[91m', `\nFAILURE: line: ${line}, column: ${column}\n`, '\x1b[0m');
    lines.push(` ${text.split('\n').slice(line - 3 > 0 ? line - 3 : 0, line).join('\n ')}`);
    lines.push('\x1b[91m', `${indents}^`, '\x1b[0m');
    const context = text
            .split('\n')
            .slice(line, line + 3 <= text.length ? line + 3 : text.length)
            .join('\n');
    lines.push(`${context}`);
    const expected = uniq(parseTree.expected).join(' or ');
    const actual = text[parseTree.index] ? text[parseTree.index].replace('\n', '\\n') : 'EOF';
    lines.push('\x1b[91m', `Got: '${actual}'. Expected: ${expected}\n`, '\x1b[0m');
    return lines;
  }
  return [];
};

module.exports = error;
