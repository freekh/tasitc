const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap
const multer = require('multer');
const multipart = multer();

const write = (ast, input, path) => new Promise((resolve, reject) => {
  resolve({ ast, input, path });
});

router.post('/tasitc/fs/write', multipart.fields([]), (req, res) => {
  const { ast, input, path } = req.body;
  // TODO: check permissions
  write(ast, input, path);
  res.sendStatus(501);
});

router.testable = {
  write,
};

module.exports = router;
