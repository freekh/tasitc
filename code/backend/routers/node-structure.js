const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap

const bodyParser = require('body-parser');
const jsonBody = bodyParser.json();

const multer = require('multer');
const multipart = multer();

const models = require('../models');

const write = (path, text) => {
  return models.NsNode.put(path, text);
};

const read = (path) => {
  return models.NsNode.getContent(path).then(results => {
    if (results.length && results[0].rows[0]) {
      return results[0].rows[0].content;
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

router.post('/tasitc/ns/ls', jsonBody, (req, res) => {
  console.log(req.body);
  res.json([{ path: 'hello.txt' }]);
});

router.testable = {
  write,
  read,
};

module.exports = router;
