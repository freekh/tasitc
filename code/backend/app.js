const express = require('express');
const path = require('path');
const getRawBody = require('raw-body');
const h = require('hyperscript');

const ns = require('./ns');
const primitives = require('../lang/primitives');
const transpile = require('../lang/transpile');
const parse = require('../lang/parser/parse');
const aliases = require('../../tests/aliases'); // TODO: remove
const log = require('../dev-utils/log');

const browserify = require('../build/browserify');
const scss = require('../build/scss');

const requests = (paths) => {
  return ['TODO: js code'];
};

const parameters = {
  todo: '!',
};

const nsNormalize = (root, baseUrl) => {
  return path.resolve(
    root, // baseUrl always starts with '/':
    path.normalize(baseUrl.slice(1))
  );
};

module.exports = root => {
  const app = express();

  const specialPaths = {
    term: '/tasitc/term.app',
    eval: '/tasitc/core/eval',
  };

  const request = (filePath, arg, ctx) => {
    if (filePath === '/localhost/ns/ls.tasitc') {
      return ns.list(arg && nsNormalize(root, arg));
    } else if (filePath === '/localhost/ns/rm.tasitc') {
      const path = `${arg}.tasitc`;
      return ns.remove(arg && nsNormalize(root, path));
    } else if (filePath === '/localhost/ns/cat.tasitc') {
      return ns.read(arg && nsNormalize(root, arg));
    } else if (filePath === '/localhost/ns/sink.tasitc') {
      const path = `${arg}.tasitc`;
      return ns.write(nsNormalize(root, path), ctx);
    } else if (filePath === '/scss.tasitc') {
      const argFilePath = nsNormalize(root, arg);
      return scss(argFilePath).then(css => {
        return new primitives.Css(css.toString());
      });
    } else if (filePath === '/browserify.tasitc') {
      const argFilePath = nsNormalize(root, arg);
      return browserify([argFilePath]).then(js => {
        return new primitives.Js(js.toString());
      });
    } else if (filePath.endsWith('.app')) {
      return ns.read(path.resolve(filePath, 'init.js')).then(text => {
        const expression = text.value;
        return new primitives.App(
          expression,
          arg,
          ctx
        );
      });
    } else if (filePath === specialPaths.eval) {
      const parseTree = arg;
      const expr = transpile(parseTree);
      return expr({}, Promise.resolve(aliases), request);
    } else if (filePath.endsWith('.tasitc')) {
      return ns.read(nsNormalize(root, filePath)).then(text => {
        const parseTree = parse(text.value);
        if (parseTree.status) {
          return new primitives.Node(parseTree.value);
        }
        return Promise.reject(new primitives.Node(null, parseTree));
      });
    } else if (filePath.endsWith('.js')) {
      return ns.read(nsNormalize(root, filePath)).then(content => {
        return new primitives.Js(content.value);
      });
    }
    return Promise.resolve(new primitives.Text(filePath));
  };

  const execute = (filePath, method, arg, params) => {
    if (filePath === specialPaths.eval) {
      const parseTree = arg;
      const expr = transpile(parseTree);
      return expr(params, Promise.resolve(aliases), request);
    }
    return ns.read(filePath).then(content => {
      const parseTree = parse(content.value);
      if (parseTree.status) {
        const expr = transpile(parseTree);
        return expr(params, Promise.resolve(aliases), request);
      }
      return Promise.reject(parseTree);
    });
  };

  const evalOrStat = (baseUrl, filePath) => {
    return new Promise((resolve, reject) => {
      if (baseUrl === specialPaths.eval) {
        resolve([baseUrl, null]);
      } else {
        ns.stat(filePath).then(stat => {
          resolve([false, stat]);
        }).catch(reject);
      }
    });
  };

  app.use('/*', (req, res) => {
    const baseUrl = req.baseUrl;
    const method = req.method;
    const params = req.query;

    const filePath = nsNormalize(root, baseUrl);
    evalOrStat(baseUrl, filePath).then(([executeEval, stat]) => {
      if (executeEval || stat.isFile()) {
        if (method === 'POST') {
          return getRawBody(req).then(bodyBuffer => {
            const body = bodyBuffer && bodyBuffer.toString(); // FIXME: inefficient?
            const arg = body && JSON.parse(body);
            return execute(executeEval || filePath, method, arg, params);
          });
        }
        return execute(filePath, method, null, params);
      } else if (stat.isDirectory() && method === 'GET') {
        // term is a special case: could be redirect, but here we want to keep path
        return request(nsNormalize(root, specialPaths.term));
      }
      // TODO: handle symlinks
      return Promise.reject(stat);
    }).then(result => {
      log.info(filePath, result);
      if (result) {
        // TODO: figure out how to handle accept VS primitive types? Could be cast?
        if (result instanceof primitives.Html || result instanceof primitives.DomElement) {
          res.contentType('text/html').send(result.toString());
        } else if (result instanceof primitives.Text) {
          res.contentType('text/plain').send(result.value);
        } else if (result instanceof primitives.Json) {
          res.json(result.value);
        } else if (result instanceof primitives.App) {
          const appMime = 'application/x-tasitc.app';
          const acceptedMime = req.accepts(['text/html', appMime]);
          if (acceptedMime === appMime) {
            res.contentType('application/x-tasitc.app').send(result.expression);
          } else {
            const expression = result.expression;
            const arg = result.arg;
            const ctx = result.ctx;
            // FIXME: find a way to avoid evals - they should at least be sandboxed...:
            const app = eval(expression)(arg, ctx, {
              h,
              requests,
              parameters,
            });

            const scripts = app.scripts || [];
            const styles = app.styles || [];
            const main = app.main;
            const stylesPromise = Promise.all(
              styles.map(expr => execute(specialPaths.eval, 'GET', parse(expr)))
            );
            const scriptsPromise = Promise.all(
              scripts.map(expr => execute(specialPaths.eval, 'GET', parse(expr)))
            );
            const mainPromise = execute(specialPaths.eval, 'GET', parse(main));
            // TODO: not sure if this is the best way to execute main method:
            const executeElement = document.createElement('script');
            executeElement.innerHTML = `tasitc(${JSON.stringify(arg)}, ${JSON.stringify(ctx)})`;

            Promise.all([scriptsPromise, stylesPromise, mainPromise]).then(([scripts, styles, main]) => {
              const html = h('html', [
                h('head', [
                  // TODO: !
                  scripts.concat([main]).map(expr => {
                    // FIXME: Avoid escaping like this or use xhtml-proper CDATA?
                    const script = document.createElement('script');
                    script.innerHTML = expr.value; // TODO: could be something else that doesnt have .value
                    return script;
                  }),
                  styles.map(expr => h('style', expr.value)), // TODO: could be something else that doesnt have .value
                ]),
                h('body', [app.elements].concat([executeElement])),
              ]);
              res.contentType('text/html').send(html.outerHTML);
            }).catch(err => {
              console.error(err);
              res.sendStatus(500);
            });
          }
        } else {
          res.send(result);
        }
      } else {
        res.send('');
      }
    }).catch(err => { // eslint-disable-line newline-per-chained-call
      let errorMsg = 'ERROR: ';
      if (err.stack) {
        errorMsg += err.stack.toString();
      } else {
        errorMsg += `'${err}' (${JSON.stringify(err)})`;
      }
      log.error(errorMsg);
      res.status(500).send(errorMsg);
    });
  });

  return app;
};
