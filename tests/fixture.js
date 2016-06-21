// FIXME: Not sure about this test fixture? Remove this comment if date is after august 2016...

const parse = require('../code/lang/parser/parse');
const parserError = require('../code/lang/parser/error');
const transpile = require('../code/lang/transpile');

const app = require('../code/backend/app');
const testEnv = require('./env');

const fs = require('fs');
const path = require('path');

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
            relative: path.relative(dir, path.resolve(dir, file)),
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
        const js = (script) => {
          return {
            status: 200,
            mime: 'application/js',
            content: script.toString(),
          };
        };
        const tasitc = (script) => {
          return {
            status: 200,
            mime: 'application/vnd.tasitc',
            content: script.toString(),
          };
        };
        resolve(eval(content.toString())); // FIXME: eval!
      }
    });
  });
};

const write = (fullPath, content) => {
  return new Promise((resolve, reject) => {
    const resolvedPath = path.resolve(`./tests/ns${(fullPath || '')}`);
    fs.writeFile(resolvedPath, content, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          mime: 'text/plain',
          status: 200,
          content: resolvedPath,
        });
      }
    });
  });
};

const request = (fullPath, argFun) => {
  return (ctx) => {
    if (fullPath === '/tasitc/core/ns/list') {
      return list(argFun(ctx));
    }
  };
};

module.exports = () => {
  const testSuite = {
    setUp: callback => {
      this.app = app(testEnv);
      this.listener = this.app.listen();
      this.port = this.listener.address().port;
      this.server = `http://localhost:${this.port}`;
      callback();
    },
    tearDown: callback => {
      if (this.listener) {
        this.listener.close();
      }
      callback();
    },
  };
  return {
    testSuite,
    test: (text, expected, parses, debug) => {
      const name = `${text} => ${JSON.stringify(expected)}`;
      testSuite[name] = (test) => { // eslint-disable-line no-param-reassign
        const parseTree = parse(text);
        if (!parseTree.status) {
          if (debug) {
            console.log(parseTree);
            console.error(parserError(parseTree).join('\n'));
          }
          test.ok(!parses, `PARSE ERROR: '${text}'`);
          test.done();
        } else {
          test.ok(parses, `EXPECTED PARSE ERROR: '${text}'`);
          if (debug) {
            console.log(JSON.stringify(parseTree, null, 2));
          }
          const expr = transpile(parseTree);
          const fakeReq = {
            cwd: '~',
          };
          const aliases = {
            map: '/tasitc/core/combinators/map',
            flatmap: '/tasitc/core/combinators/flatmap',
            //
            ifte: '/tasitc/core/combinators/ifte',
            regex: '/tasitc/core/combinators/regex',
            //
            text: '/tasitc/core/combinators/text',
            html: '/tasitc/core/combinators/html',
            //
            ls: '/tasitc/core/ns/list',
            write: '/tasitc/core/ns/write',
            //
            li: '/tasitc/dom/li',
          };
          expr(fakeReq, Promise.resolve(aliases), request).then(result => {
            test.deepEqual(result, expected);
            test.done();
          }).catch(err => {
            if (err.stack) {
              test.ok(false, err.stack.toString());
            } else {
              test.ok(false, `ERROR: '${err}' (${JSON.stringify(err)})`);
            }
            test.done();
          });
        }
      };
    },
  };
};
