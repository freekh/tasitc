const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap

const bodyParser = require('body-parser');
const jsonBody = bodyParser.json();

const multer = require('multer');
const multipart = multer();

const models = require('../models');
const normalize = require('../../misc/normalize');

const write = (path, text) => {
  return models.NsNode.put(path, text);
};

const read = (path) => {
  return models.NsNode.list(path).then(results => {
    if (results.length && results[0].rows[0]) {
      return results[0].rows[0];
    } else if (results.length && results[0].rowCount === 0) {
      return [];
    }
    return null;
  });
};

router.post('/tasitc/ns/write', multipart.fields([]), (req, res) => {
  // FIXME: remove ast?
  const { ast, text, path } = req.body;
  // FIXME: fix this, is unecessary
  const astJson = JSON.parse(ast);
  const exprText = text.slice(astJson.expression.start, astJson.start);
  write(path, exprText);
  res.sendStatus(200);
});

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

router.post('/tasitc/ns/ls', jsonBody, (req, res) => {
  const body = req.body;
  let path = null;
  if (body.path && body.cwd) {
    path = normalize(body.cwd, aliases, body.path);
  } else if (body.cwd && !body.path) {
    path = normalize(body.cwd, aliases, '');
  }

  if (!path) {
    res.status(500).json({ msg: 'Could not build path! Missing cwd and/or path in request',
                           request: body });
  } else {
    read(path).then(results => {
      res.json(results);
    }).catch(err => {
      res.sendStatus(500);
    });
  }
});

router.testable = {
  write,
  read,
};

module.exports = router;
