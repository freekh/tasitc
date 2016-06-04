const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap

const bodyParser = require('body-parser');
const jsonBody = bodyParser.json();

const multer = require('multer');
const multipart = multer();

const models = require('../models');
const normalize = require('../../misc/normalize');
const log = require('../../misc/log');

const write = (path, text) => {
  return models.NsNode.put(path, text);
};

const read = (path) => {
  return models.NsNode.list(path).then(results => {
    if (results.length && results[0].rows) {
      return results[0].rows;
    } else if (results.length && results[0].rowCount === 0) {
      return [];
    }
    return null;
  });
};

// Fake:
const aliases = {
  ls: '/tasitc/ns/ls',
  html: '/tasitc/dom/html',
  body: '/tasitc/dom/body',
  head: '/tasitc/dom/head',
  style: '/tasitc/dom/style',
  div: '/tasitc/dom/div',
  ul: '/tasitc/dom/ul',
  li: '/tasitc/dom/li',
};

router.get('/:path*', (req, res, next) => {
  const path = `/${req.params.path}${req.params[0]}`;
  read(path).then(results => {
    if (results && results.length === 1 && results[0].path === path) {
      res.json({ whatgives: req.params });
    } else {
      console.log('next', results, path, req.params);
      next();
    }
  });
});

router.post('/tasitc/ns/write', multipart.fields([]), (req, res) => {
  const { ast, text, path, env } = req.body;
  // FIXME: fix this, is unecessary
  const astJson = JSON.parse(ast);
  const envJson = JSON.parse(env);

  const exprText = text.slice(astJson.expression.start, astJson.start);
  const normalizePath = normalize(envJson.cwd, envJson.user, aliases, path);
  write(normalizePath, exprText);
  res.sendStatus(200);
});

router.post('/tasitc/ns/ls', jsonBody, (req, res) => {
  const { arg, env } = req.body;
  let path = null;
  if (arg.path && env.cwd) {
    path = normalize(env.cwd, env.user, aliases, arg.path);
  } else if (env.cwd && !arg.path) {
    path = normalize(env.cwd, env.user, aliases, '');
  }

  if (!path) {
    res.status(500).json({ msg: 'Could not build path! Missing cwd and/or path in request',
                           request: req.body });
  } else {
    read(path).then(results => {
      res.json(results);
    }).catch(err => {
      log.error(err);
      res.sendStatus(500);
    });
  }
});


router.testable = {
  write,
  read,
};

module.exports = router;
