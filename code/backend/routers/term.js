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
const aliases = require('../../../tests/aliases'); // TODO: remove

const list = (fullPath) => {
  return new Promise((resolve, reject) => {
    const dir = path.resolve(fullPath && (`./tests/ns${fullPath}`) || './tests/ns/freekh');
    fs.readdir(dir, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files.map(file => {
          return {
            absolute: path.resolve(dir, file).replace(dir, ''),
            name: file,
          };
        }));
      }
    });
  });
};

const read = (fullPath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(`./tests/ns${fullPath || ''}`), (err, content) => {
      if (err) {
        reject(err);
      } else {
        resolve(content.toString());
      }
    });
  });
};

const request = (fullPath) => {
  return argFun => {
    return (ctx) => {
      if (fullPath === '/tasitc/core/ns/list') {
        return list(argFun ? argFun(ctx) : '/freekh');
      }
      return read(fullPath);
    };
  };
};

router.post('/tasitc/term/execute', jsonParser, (req, res) => {
  const parseTree = req.body;
  if (!parseTree) {
    res.json([]);
  }
  const expr = transpile(parseTree);
  expr({}, Promise.resolve(aliases), request).then(result => {
    log.info(parseTree.text, result);
    if (result) {
      res.json(result);
    } else {
      res.send('');
    }
  }).catch(err => {
    if (err.stack) {
      log.error(err.stack.toString());
    } else {
      log.error(`ERROR: '${err}' (${JSON.stringify(err)})`);
    }
    res.status(500).send(err.toString());
  });
});

module.exports = router;
