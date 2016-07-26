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

const editor = {
  dir: path.resolve('./code/editor'),
  js: {
    path: '/tasitc/editor/js',
    index: 'index.js',
  },
  css: {
    path: '/tasitc/editor/css',
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

router.get(editor.js.path, (req, res) => {
  const stream = res.contentType('application/json');
  browserify(editor.dir, editor.js.index, stream);
});

router.get(editor.css.path, (req, res) => {
  scss(path.resolve(editor.dir, editor.css.scss)).then(css => {
    res.contentType('text/css').send(css.toString());
  }).catch(err => {
    log.error(err);
    res.sendStatus(500);
  });
});

router.get('/', (req, res) => {
  res.redirect('freekh/');
});

router.get('/freekh/editor', (req, res) => {
  const username = 'freekh';
  const path = `/${username}${req.params[0]}`;
  log.info('user', username, 'cwd: ', path);

  const page = h('html', [
    h('head', [
      h('link', {
        rel: 'stylesheet',
        type: 'text/css',
        href: '/freekh/editor/lib/codemirror.css',
      }),
      h('link', {
        rel: 'stylesheet',
        type: 'text/css',
        href: '/freekh/editor/theme/monokai',
      }),
      h('link', {
        rel: 'stylesheet',
        type: 'text/css',
        href: editor.css.path,
      }),
    ]),
    h('body', [
      h('div#editor'),
      h('script', {
        type: 'application/javascript',
        src: editor.js.path,
      }),
    ]),
  ]);
  const html = page.outerHTML;
  res.contentType('text/html').send(html);
});

router.get('/freekh/editor/theme/:name', (req, res) => {
  const name = req.params.name;
  res.sendFile(path.resolve(`./node_modules/codemirror/theme/${name}.css`));
});

router.get('/freekh/editor/lib/:name', (req, res) => {
  const name = req.params.name;
  res.sendFile(path.resolve(`./node_modules/codemirror/lib/${name}`));
});


router.get('/freekh/editor/keymap/:name', (req, res) => {
  const name = req.params.name;
  res.sendFile(path.resolve(`./node_modules/codemirror/keymap/${name}.js`));
});



// TODO: REMOVE FROM HERE

const fs = require('fs');
const transpile = require('../../lang/transpile');
const parse = require('../../lang/parser/parse');
const aliases = require('../../../tests/aliases'); // TODO: remove
const ast = require('../../lang/ast');
const primitives = require('../../lang/primitives');
const root = path.resolve('./tests/ns'); // TODO: shoudl not be refering to tests

const read = (fullPath) => { // FIXME: fullPath is not full path it is relative to root! change name everywhere!
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(root, fullPath), (err, content) => {
      if (err) {
        reject(err);
      } else {
        resolve(new primitives.Text(content.toString()));
      }
    });
  });
};

const list = (fullPath) => {
  return new Promise((resolve, reject) => {
    const dir = path.resolve(root, fullPath);
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
    const resolvedPath = path.resolve(root, fullPath);
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
    const resolvedPath = path.resolve(root, fullPath);
    fs.writeFile(resolvedPath, content, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(new primitives.Text(fullPath));
      }
    });
  });
};

const stat = (fullPath) => {
  return new Promise((resolve, reject) => {
    fs.stat(path.resolve(root, fullPath), (err, stat) => {
      if (err) {
        reject(err);
      } else {
        resolve(stat);
      }
    });
  });
};

const request = (fullPath, arg, ctx) => {
  if (fullPath === '/localhost/ns/ls.tasitc') {
    return list(arg);
  } else if (fullPath === '/localhost/ns/rm.tasitc') {
    const path = `${arg}.tasitc`;
    return remove(path);
  } else if (fullPath === '/localhost/ns/cat.tasitc') {
    return read(arg);
  } else if (fullPath === '/localhost/ns/sink.tasitc') {
    const path = `${arg}.tasitc`;
    return write(path, ctx);
  } else if (fullPath.endsWith('.app.js')) {
    return read(fullPath).then(content => {
      console.log('-->', content);
      return new primitives.App(fullPath, arg);
    });
  } else if (fullPath.endsWith('.tasitc')) {
    return read(fullPath).then(text => {
      const parseTree = parse(text.value);
      if (parseTree.status) {
        return new primitives.Node(parseTree.value);
      }
      return Promise.reject(new primitives.Node(null, parseTree));
    });
  }
  return Promise.resolve(new primitives.Text(fullPath));
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
      } else if (result instanceof primitives.App) {
        res
          .contentType('application/json;x-tasitc.app')
          .send(JSON.stringify(result));
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

router.post('/:username*', bodyParser.text(), (req, res) => {
  const username = req.params.username;
  const path = `/${username}${req.params[0]}`;
  write(path.slice(1), req.body).then(() => { // FIXME: slicing is done because /freekh/grep.tasitc is absloute but it should not be
    res.sendStatus(200);
  }).catch(err => {
    log.error(err);
    res.sendStatus(500);
  });
});

router.get('/:username*', (req, res) => {
  const username = req.params.username;
  const path = `/${username}${req.params[0]}`;
  log.info('user', username, 'path: ', path);
  stat(path.slice(1)).then(stat => { // FIXME: slicing is done because /freekh/grep.tasitc is absloute but it should not be
    if (stat.isFile()) {
      read(path.slice(1)).then(content => { // FIXME: slicing is done because /freekh/grep.tasitc is absloute but it should not be
        res.send(content.value);
      }).catch(err => {
        log.error(err);
        res.sendStatus(500);
      });
    } else if (stat.isDirectory()) {
      const page = h('html', [
        h('head', [
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
    } else {
      res.status(404).send(`path: '${path}' (root: ${root}) not found`);
    }
  }).catch(err => {
    log.error(err);
    res.sendStatus(500);
  });
});

module.exports = router;
