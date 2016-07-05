const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap

const path = require('path');
const h = require('hyperscript');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const log = require('../../dev-utils/log');
const browserify = require('../../build/browserify');
const scss = require('../../build/scss');


const term = {
  dir: path.resolve('./code/term'),
  js: {
    path: '/tasitc/term/js',
    index: 'index.js',
  },
  css: {
    path: '/tasitc/term/css',
    scss: 'index.scss',
  },
};

router.use('/tasitc/term/assets', express.static(path.resolve('./assets')));

router.get(term.js.path, (req, res) => {
  const stream = res.contentType('application/json');
  browserify(term.dir, term.js.index, stream);
});

router.get(term.css.path, (req, res) => {
  scss(path.resolve(term.dir, term.css.scss)).then(css => {
    res.contentType('text/css').send(css.toString());
  }).catch(err => {
    log.error(err);
    res.sendStatus(500);
  });
});

router.get('/', (req, res) => {
  res.redirect('freekh/');
});

router.get('/freekh*', (req, res) => {
  const username = 'freekh';
  const path = `/${username}${req.params[0]}`;
  log.info('user', username, 'cwd: ', path);

  const page = h('html', [
    h('header', [
      h('link', {
        rel: 'stylesheet',
        type: 'text/css',
        href: term.css.path,
      }),
    ]),
    h('body', [
      h('div#term'),
      h('script', {
        type: 'application/javascript',
        defer: 'defer',
        src: term.js.path,
      }),
    ]),
  ]);
  const html = page.outerHTML;
  res.contentType('text/html').send(html);
});


// TODO: REMOVE FROM HERE

const fs = require('fs');
const transpile = require('../../lang/transpile');
const parse = require('../../lang/parser/parse');
const aliases = require('../../../tests/aliases'); // TODO: remove
const ast = require('../../lang/ast');
const primitives = require('../../lang/primitives');

const read = (fullPath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(`./tests/ns${fullPath || ''}`), (err, content) => {
      if (err) {
        reject(err);
      } else {
        resolve(new primitives.Text(content.toString()));
      }
    });
  });
};

const list = (fullPath) => {
  const user = 'freekh';
  return new Promise((resolve, reject) => {
    const dir = path.resolve(fullPath && (`./tests/ns${fullPath}`) || `./tests/ns/${user}`);
    fs.readdir(dir, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(new primitives.Node(
          new ast.List(files.map(file => {
            return new ast.Instance([{
              key: new ast.Text('absolute'),
              value: new ast.Text(path.resolve(dir, file).replace(path.resolve(dir, '..'), '')),
            }, {
              key: new ast.Text('name'),
              value: new ast.Text(file),
            }]);
          }))));
      }
    });
  });
};

const remove = (fullPath) => {
  return new Promise((resolve, reject) => {
    const resolvedPath = path.resolve(`./tests/ns${(fullPath || '')}`);
    fs.unlink(resolvedPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(new primitives.Text(fullPath));
      }
    });
  });
};

const write = (fullPath, content) => {
  return new Promise((resolve, reject) => {
    const resolvedPath = path.resolve(`./tests/ns${(fullPath || '')}`);
    fs.writeFile(resolvedPath, content, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(new primitives.Text(fullPath));
      }
    });
  });
};

const request = (fullPath, arg, ctx) => {
  if (fullPath === '/localhost/ns/ls.tasitc') {
    return list(arg, ctx);
  } else if (fullPath === '/localhost/ns/rm.tasitc') {
    const path = `${arg}.tasitc`;
    return remove(path);
  } else if (fullPath === '/localhost/ns/sink.tasitc') {
    const path = `${arg}.tasitc`;
    return write(path, ctx);
  } else if (fullPath.endsWith('.tasitc')) {
    return read(fullPath).then(text => {
      const parseTree = parse(text.value);
      if (parseTree.status) {
        return new primitives.Node(parseTree.value);
      }
      return Promise.reject(new primitives.Node(null, parseTree));
    });
  }
  return read(fullPath);
};

router.post('/tasitc/term/execute', jsonParser, (req, res) => {
  const parseTree = req.body;
  if (!parseTree) {
    res.json([]);
  }
  console.log('parseTree', JSON.stringify(parseTree, null, 2));
  const expr = transpile(parseTree);
  expr({}, Promise.resolve(aliases), request).then(result => {
    log.info(parseTree.text, result);
    if (result) {
      if (result instanceof primitives.Html || result instanceof primitives.DomElement) {
        res.contentType('text/html').send(result.toString());
      } else if (result instanceof primitives.Text) {
        res.contentType('text/plain').send(result.value);
      } else if (result instanceof primitives.Json) {
        res.json(result.value);
      } else {
        res.send(result);
      }
    } else {
      res.send('');
    }
  }).catch(err => {
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

module.exports = router;
