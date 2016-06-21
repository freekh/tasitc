const express = require('express');
const router = express.Router(); // eslint-disable-line new-cap

const multer = require('multer'); // TODO: remove for now?
const multipart = multer();

const fs = require('fs');
const path = require('path');

module.exports = (pg, pgConnectionString) => { // TODO: remove pg
  router.get('/:path*', (req, res, next) => {
    const path = `/${req.params.path}${req.params[0]}`;
    console.warn('path', path);
    next();
  });

  router.post('/tasitc/ns/write', multipart.fields([]), (req, res) => {
    const { ast, text, path } = req.body;
    // FIXME: fix this, is unecessary
    const astJson = JSON.parse(ast);

    const exprText = text.slice(astJson.expression.start, astJson.start);
    write(path, exprText);
    res.sendStatus(200);
  });

  return router;
};
