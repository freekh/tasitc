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

// TODO: move
const parse = require('../../lang/parser/parse');
const transpile = require('../../lang/transpile');

// TODO: remove
const h = require('hyperscript');
const get = require('../../misc/get');
const postJson = require('../../misc/post-json');

const responseToHyperscript = (elemType, res) => {
  if (res.mime === 'text/plain') {
    return h(elemType, res.content);
  } else if (res.mime === 'application/json') {
    if (res.content instanceof Array) {
      const jsonContent = res.content.map(element => {
        if (typeof element === 'string') {
          return element;
        }
        return JSON.stringify(element);
      }).join('');
      const elem = h(elemType);
      elem.innerHTML = jsonContent;
      return elem;
    } else if (typeof res.content === 'string') {
      return h(elemType, res.content);
    } else if (res.content instanceof Object) {
      return h(elemType, res.content, []);
    }
    return res.content;
  } else if (res.mime === 'text/html') {
    const elem = h(elemType);
    elem.innerHTML = res.content;
    return elem;
  }
  return res.content.toString();
};

const request = (promisedPath, argRaw, env) => {
  const promiseArg = argRaw instanceof Promise ?
          argRaw : Promise.resolve(argRaw);

  return Promise.all([promisedPath, promiseArg]).then(([pathResponse, argResponse]) => {
    if (argResponse && argResponse.status !== 200) { // TODO: could be different than 200
      return Promise.reject({
        status: 404,
        mime: 'text/plain',
        content: `Malformed argument ${JSON.stringify(argResponse)}`,
      });
    }
    const arg = argResponse ? argResponse.content : '';
    const { path, type } = pathResponse.content; // TODO: check status
    let content = '';
    let mime = 'text/plain';
    if (path === '/tasitc/dom/html') {
      content = responseToHyperscript('html', argResponse).outerHTML;
      mime = 'text/html';
    } else if (path === '/tasitc/dom/ul') {
      content = responseToHyperscript('ul', argResponse).outerHTML;
      mime = 'text/html';
    } else if (path === '/tasitc/dom/body') {
      content = responseToHyperscript('body', argResponse).outerHTML;
      mime = 'text/html';
    } else if (path === '/tasitc/dom/head') {
      content = responseToHyperscript('head', argResponse).outerHTML;
      mime = 'text/html';
    } else if (path === '/tasitc/dom/style') {
      content = responseToHyperscript('style', argResponse).outerHTML;
      mime = 'text/html';
    } else if (path === '/tasitc/dom/li') {
      content = responseToHyperscript('li', argResponse).outerHTML;
      mime = 'text/html';
    } else if (path === '/tasitc/dom/div') {
      content = responseToHyperscript('div', argResponse).outerHTML;
      mime = 'text/html';
    } else if (path === '/tasitc/ns/ls') {
      return postJson('/tasitc/ns/ls', { arg, env });
    } else {
      return get(path); // HAXIN
      return Promise.reject({
        status: 404,
        content: `Could not find/execute: ${JSON.stringify(path)}`,
        mime: 'text/plain',
      });
    }
    return Promise.resolve({
      status: 200,
      content,
      mime,
    });
  });
};


router.get('/:path*', (req, res, next) => {
  const path = `/${req.params.path}${req.params[0]}`;
  read(path).then(results => {
    if (results && results.length === 1 && results[0].path === path) {
      const text = results[0].text;
      const parseTree = parse(text);
      // TODO: remove:
      const cwd = '~';
      const user = 'freekh';
      const lookup = (id) => {
        const content = {
          path: normalize(cwd, user, aliases, id),
          type: 'get',
        };
        return ($) => {
          return Promise.resolve({
            status: 200,
            mime: 'text/plain',
            content,
          });
        };
      };
      if (parseTree.status) {
        const fn = transpile(parseTree.value, lookup, parseTree.text, { cwd, user });
        const fakeReq = Promise.resolve({
          request: { verb: 'get', path: '/tasitc/term/freekh' },
          status: 200,
          mime: 'application/json',
          content: { cwd: '/freekh', params: {} },
        });
        fn(fakeReq).then(result => {
          console.log('!', res);
          res
            .contentType(result.mime)
            .status(result.status)
            .send(result.content);
        }).catch(err => {
          console.error('?', path, err, parseTree);
          res.json({ error: err });
        });
      } else {
        res.status(500).json(parseTree);
      }
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
  console.log('HELLO!');
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
