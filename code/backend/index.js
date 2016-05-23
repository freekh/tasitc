const express = require('express');
const path = require('path');
const h = require('hyperscript');

const log = require('../misc/log');
const browserify = require('../build/browserify');
const scss = require('../build/scss');

const app = express();

const tux = {
  dir: path.resolve('./code/tux'),
  js: {
    path: '/tasitc/tux/js',
    index: 'index.js',
  },
  css: {
    path: '/tasitc/tux/css',
    scss: 'index.scss',
  },
};

app.use('/assets', express.static(path.resolve('./assets')));

app.get('/', (req, res) => {
  const page = h('html', [
    h('header', [
      h('link', {
        rel: 'stylesheet',
        type: 'text/css',
        href: tux.css.path,
      }),
    ]),
    h('body', [
      h('div#tux'),
      h('script', {
        type: 'application/javascript',
        defer: 'defer',
        src: tux.js.path,
      }),
    ]),
  ]);
  const html = page.outerHTML;
  res.contentType('text/html').send(html);
});

app.get(tux.js.path, (req, res) => {
  const stream = res.contentType('application/json');
  browserify(tux.dir, tux.js.index, stream);
});

app.get(tux.css.path, (req, res) => {
  scss(path.resolve(tux.dir, tux.css.scss)).then(css => {
    res.contentType('text/css').send(css.toString());
  }).catch(err => {
    log.error(err);
    res.sendStatus(500);
  });
});


app.listen(8080);
