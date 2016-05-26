const h = require('hyperscript');
const { ast, parse } = require('../lang/grammar');
const renderParseError = require('./render-parse-error');
const render = require('./render');
const services = require('./services');
const log = require('../misc/log');
const post = require('../misc/post');

const transpile = (node, input) => { // TODO: dont. do. this... use Function instead!
  const commons = {
    args: (args) => `[${args.map(arg => `${transpile(arg, input)}`).join(', ')}]`,
  };

  if (node instanceof ast.Comprehension) {
    return transpile(node.expression, input) + node.targets.map((n, i) => {
      let comprehension = 'map';
      if (i === 0 && node.expression instanceof ast.Call ||
          i > 0 && node.targets[i - 1] instanceof ast.Call) {
        comprehension = 'then';
      }

      return `.${comprehension}(function($) { return ${transpile(n, input)} })`;
    }).join('');
  } else if (node instanceof ast.Call) {
    // if not alias and is atom, use atom directly
    return `call('${node.id.value}', ${commons.args(node.args)}, $).then(e => e.content)`;
  } else if (node instanceof ast.Id) {
    return `callOrString('${node.value}', [], $).then(e => e.content)`;
  } else if (node instanceof ast.Str) {
    return `'${node.value}'`;
  } else if (node instanceof ast.Parameter) {
    return `parameter('${node.id}')`;
  } else if (node instanceof ast.Sink) {
    return `write(${transpile(node.expression, input)}, ` +
      `'${JSON.stringify(node.expression)}', '${JSON.stringify(input)}', '${node.path.value}')`;
  } else if (node instanceof ast.Keyword) {
    return `{'${node.id}': ${transpile(node.value, input)}}`;
  } else if (node instanceof ast.Num) {
    return `${node.value}`;
  } else if (node instanceof ast.Context) {
    return `\$${node.path.map(pathElem => {
      if (pathElem instanceof ast.Subscript) {
        return `[${pathElem.index.value}]`;
      } else if (pathElem instanceof ast.Attribute) {
        return `.${pathElem.attr.value}`;
      }
      throw new Error(`Unknown AST path element: ${JSON.stringify(pathElem)}`);
    }).join('')}`;
  }
  throw new Error(`Unknown AST node : ${JSON.stringify(node)}}`);
};

const write = (expression, ast, input, path) => { // eslint-disable-line no-unused-vars
  log.debug('Writing to:', path);
  return expression.then(
    () => post('/tasitc/fs/write', {
      path,
      ast,
      input,
    }).then(() => expression)
  );
};

const parameter = (id) => { // eslint-disable-line no-unused-vars
  log.debug('parameter', id);
  return Promise.resolve('Test');
};

const exec = (id, args, context) => {
  const service = services[id];
  const argsPromises = args && args.map(a => {
    if (a instanceof Array) {
      return Promise.all(a);
    } else if (a instanceof Promise) {
      return a;
    } else if (a instanceof Object) {
      // FIXME: this is a keyword so this might be right? still smells bad:
      const id = Object.keys(a)[0];
      if (a[id] instanceof Promise) {
        return a[id].then(value => {
          const ret = {};
          ret[id] = value;
          return ret;
        });
      }
      return Promise.resolve(a[id]);
    }
    return Promise.resolve(a);
  }) || [];
  return Promise.all(argsPromises)
    .then(args => service(id, args, context));
};

const callOrString = (id, args, context) => { // eslint-disable-line no-unused-vars
  if (services[id]) {
    return exec(id, args, context);
  }
  return Promise.resolve(id);
};

const call = (id, args, context) => { // eslint-disable-line no-unused-vars
  const service = services[id];
  if (service) {
    // TODO: hmm... this flattening is pret-ty ugly!
    // FIXME: keywords and args WILL break unless it only flattens things
    //        that are supposed to be flattened (Promises)
    return exec(id, args, context);
  }
  return Promise.reject({ msg: `Unknown service: '${id}'`, id, args, code: 0 });
};

const $ = {}; // eslint-disable-line no-unused-vars

module.exports = (cwd, input) => {
  if (!input) {
    return Promise.resolve(render(null, ''));
  }
  const parsed = parse(input);
  if (parsed.status) {
    const ast = parsed.input;
    const transpiled = transpile(ast, input);
    log.debug('Transpiled', transpiled, ast, input);
    // FIXME: eval? REAAAAAALY?
    return eval(transpiled) // eslint-disable-line no-eval
      .then(input => render(input, null))
      .catch(err => render(null, err));
  }
  return Promise.resolve(renderParseError(input, parsed));
};
