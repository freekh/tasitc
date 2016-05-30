const t = require('transducers-js');
const { map, mapcat, filter, comp, into } = t;

const { ast } = require('../lang/grammar');

const transpile = (node, text) => {
  if (node.type === 'Composition') {
    const length = node.elements.length;
    if (length > 1) {
      return comp(...node.elements.map((elem, i) => {
        if (i === length) {
          return map(transpile(elem, text));
        }
        return mapcat(transpile(elem, text));
      }));
    } else if (length === 1) {
      const elem = node.elements[0];
      return map(transpile(elem, text));
    }
    throw new Error(`Mal-formed composition node: ${JSON.stringify(node)}`);

    // return comp(...node.elements.map(elem => {
    //   return transpile(elem, text);
    // }));
  } else if (node.type === 'Call') {
    if (node.id.value === 'ls') {
      return ($) => {
        return [{ path: 'a.txt' }, { path: 'b.txt' }, { path: 'c.txt' }];
      };
    } else if (node.id.value === 'li') {
      return ($) => {
        const args = node.args.map(arg => {
          if (arg.type === 'Composition') {
            return into([], transpile(arg, text), [[]]).join('');
          }
          return transpile(arg, text)($);
        });
        return [`<li>${args.join('')}</li>`];
      };
    } else if (node.id.value === 'ul') {
      return ($) => {
        const args = node.args.map(arg => {
          if (arg.type === 'Composition') {
            return into([], transpile(arg, text), [[]]).join('');
          }
          return transpile(arg, text)($);
        });
        return [`<ul>${args.join('')}</ul>`];
      };
    } else if (node.id.value === 'html') {
      return ($) => {
        const args = node.args.map(arg => {
          if (arg.type === 'Composition') {
            return into([], transpile(arg, text), [[]]).join('');
          }
          return transpile(arg, text)($);
        });
        return [`<html>${args.join('')}</html>`];
      };
    } else {
      throw new Error('???'+JSON.stringify(node.id.value));
    }
  } else if (node.type === 'Id') {
    return ($) => { return [node.value]; };
  } else if (node.type === 'Stack') {
    return ($) => {
      let ret = $;
      node.path.forEach(elem => {
        if (elem.type === 'Attribute') {
          ret = $[elem.attr.value];
        }
      });
      return [ret];
    };
  } else if (node.type === 'Instance') {
    return ($) => {
      const ret = {};
      node.value.forEach(keyValue => {
        Object.keys(keyValue).forEach(key => {
          console.log('?', $)
          ret[key] = into([], transpile(keyValue[key], text), $);
        });
      })
      return [ret];
    };
  } else if (node.type === 'List') {
    return ($) => {
      return node.elements.map(elem => {
        console.log(elem)
        return into([], transpile(elem, text), [$]);
      })
    };
  } else {
    console.warn('???', node.type);
    return ($) => { return $; };
  }
  // } else if (node.type === 'Call') {
  //   return `comp(???)`;
  // } else if (node.type === 'Id') {
  //   return `id(${node.value})`;
  // } else if (node.type === 'Str') {
  //   return `'${node.value}'`;
  // } else if (node.type === 'Parameter') {
  //   return `parameter('${node.id}')`;
  // } else if (node.type === 'Sink') {
  //   return `write(${transpile(node.expression, text)}, ` +
  //     `'${JSON.stringify(node.expression)}', '${JSON.stringify(text)}', '${node.path.value}')`;
  // } else if (node.type === 'Keyword') {
  //   return `{'${node.id}': ${transpile(node.value, text)}}`;
  // } else if (node.type === 'Num') {
  //   return `${node.value}`;
  // } else if (node.type === 'Instance') {
  //   return `${JSON.stringify(node.data)}`;
  // } else if (node.type === 'List') {
  //   return `${JSON.stringify(node.elements)}`;
  // } else if (node.type === 'Context') {
  //   return `\$${node.path.map(pathElem => {
  //     if (pathElem instanceof ast.Subscript) {
  //       return `[${pathElem.index.value}]`;
  //     } else if (pathElem instanceof ast.Attribute) {
  //       return `.${pathElem.attr.value}`;
  //     }
  //     throw new Error(`Unknown AST path element: ${JSON.stringify(pathElem)}`);
  //   }).join('')}`;
  // }
  throw new Error(`Unknown AST node (${node.type}): ${JSON.stringify(node)}`);
};

// TODO: DELETE THIS
const transpile2 = (node, text) => { // TODO: dont. do. this... use Function instead!
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
