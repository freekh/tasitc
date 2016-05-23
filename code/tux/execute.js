const h = require('hyperscript');
const { ast, parse } = require('../lang/grammar');
const renderParseError = require('./render-parse-error');
const render = require('./render');
const services = require('./services');
const post = require('../misc/post');

const transpile = (node) => { // TODO: dont do this... use Function instead!
  const commons = {
    args: (args) => `[${args.map(arg => `${transpile(arg)}`).join(', ')}]`,
  };

  if (node instanceof ast.Comprehension) {
    return transpile(node.expression) + node.targets.map((n, i) => {
      let comprehension = 'map';
      if (i === 0 && node.expression instanceof ast.Call ||
          i > 0 && node.targets[i - 1] instanceof ast.Call) {
        comprehension = 'then';
      }

      return `.${comprehension}(function($) { return ${transpile(n)} })`;
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
    return `sink(${transpile(node.expression)}, '${node.path.value}')`;
  } else if (node instanceof ast.Keyword) {
    return `{'${node.id}': ${transpile(node.value)}}`;
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

const sink = (expression, id) => { // eslint-disable-line no-unused-vars
  return expression.then(
    result => {
      const data = h('html', [
        result[0],
        result[1] ? h('body', result[1]) : null,
      ]).outerHTML;
      console.log('!!', data);
      return post(`/tasitc/sink/${encodeURIComponent(id)}`, data)
        .then(() => result);
    }
  );
};

const parameter = (id) => { // eslint-disable-line no-unused-vars
  console.log('parameter', id);
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
      return a[id].then(value => {
        const ret = {};
        ret[id] = value;
        return ret;
      });
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

module.exports = (cwd, value) => {
  if (!value) {
    return Promise.resolve(render(null, ''));
  }
  const parsed = parse(value);
  if (parsed.status) {
    const ast = parsed.value;
    const transpiled = transpile(ast);
    // FIXME: !!
    return eval(transpiled) // eslint-disable-line no-eval
      .then(value => render(value, null))
      .catch(err => render(null, err));
  }
  return Promise.resolve(renderParseError(value, parsed));
};
