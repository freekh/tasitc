const { ast } = require('../lang/grammar');

const transpile = (node, text) => { // TODO: dont. do. this... use Function instead!
  const commons = {
    args: (args) => {
      return '[' + // eslint-disable-line prefer-template
        args.map(arg => {
          return `${transpile(arg, text)}`;
        }).join(', ') +
      ']';
    },
  };

  if (node.type === 'Comprehension') {
    return transpile(node.expression, text) + node.targets.map((n) => {
      return `.pipe(function($) { return ${transpile(n, text)} })`;
    }).join('');
  } else if (node.type === 'Call') {
    // if not alias and is atom, use atom directly
    return `call('${node.id.value}', ${commons.args(node.args)}, $)`;
  } else if (node.type === 'Id') {
    return `callOrString('${node.value}', [], $)`;
  } else if (node.type === 'Str') {
    return `'${node.value}'`;
  } else if (node.type === 'Parameter') {
    return `parameter('${node.id}')`;
  } else if (node.type === 'Sink') {
    return `write(${transpile(node.expression, text)}, ` +
      `'${JSON.stringify(node.expression)}', '${JSON.stringify(text)}', '${node.path.value}')`;
  } else if (node.type === 'Keyword') {
    return `{'${node.id}': ${transpile(node.value, text)}}`;
  } else if (node.type === 'Num') {
    return `${node.value}`;
  } else if (node.type === 'Context') {
    return `\$${node.path.map(pathElem => {
      if (pathElem instanceof ast.Subscript) {
        return `[${pathElem.index.value}]`;
      } else if (pathElem instanceof ast.Attribute) {
        return `.${pathElem.attr.value}`;
      }
      throw new Error(`Unknown AST path element: ${JSON.stringify(pathElem)}`);
    }).join('')}`;
  }
  throw new Error(`Unknown AST node : ${JSON.stringify(node)}`);
};

module.exports = transpile;
