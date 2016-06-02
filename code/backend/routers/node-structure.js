const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap
const multer = require('multer');
const multipart = multer();
const models = require('../models');

const write = (path, input) => {
  return models.FsNode.put(path, input);
};

const read = (path) => {
  return models.FsNode.getContent(path).then(results => {
    if (results.length && results[0].rows[0]) {
      return results[0].rows[0].content;
    }
    return null;
  });
};

router.post('/tasitc/ns/write', multipart.fields([]), (req, res) => {
  // FIXME: remove ast?
  const { ast, input, path } = req.body;
  // TODO: check permissions
  write(input, path);
  res.sendStatus(501);
});

router.testable = {
  write,
  read,
};

module.exports = router;
