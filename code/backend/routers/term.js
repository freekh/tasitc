const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap

const path = require('path');
const h = require('hyperscript');

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

router.get('/:username*', (req, res) => {
  const username = req.params.username;
  const path = `/${username}/${req.params[0]}`;
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


module.exports = router;
