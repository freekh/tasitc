const fs = require('fs');
const path = require('path');

const primitives = require('../lang/primitives');
const ast = require('../lang/ast');

const read = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, content) => {
      if (err) {
        reject(err);
      } else {
        resolve(new primitives.Text(content.toString()));
      }
    });
  });
};

const list = (dir) => {
  return new Promise((resolve, reject) => {
    fs.readdir(dir, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(new primitives.Node(
          new ast.List(files.map(file => {
            return new ast.Instance([{
              key: new ast.Text('absolute'),
              value: new ast.Text(path.resolve(dir, file).replace(path.resolve(dir, '..'), '')),
            }, {
              key: new ast.Text('name'),
              value: new ast.Text(file),
            }]);
          }))));
      }
    });
  });
};

const remove = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(new primitives.Text(filePath));
      }
    });
  });
};

const write = (filePath, content) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, content, err => {
      if (err) {
        reject(err);
      } else {
        resolve(new primitives.Text(filePath));
      }
    });
  });
};

const stat = (filePath) => {
  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stat) => {
      if (err) {
        reject(err);
      } else {
        resolve(stat);
      }
    });
  });
};

module.exports = {
  read,
  write,
  list,
  remove,
  stat,
};
