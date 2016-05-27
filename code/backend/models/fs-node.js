const { pgConnectionString } = require('../env');
const pg = require('pg').native;

const execute = (statements) => {
  return new Promise((resolve, reject) => {
    pg.connect(pgConnectionString, (err, client, done) => {
      if (err) {
        reject(err);
      } else {
        const results = Promise.all(
          statements.map(statement => {
            return new Promise((resolve, reject) => {
              client.query(statement, (err, result) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(result);
                }
              });
            });
          }));
        results.then(results => {
          resolve(results);
          done();
        }).catch(err => {
          reject(err);
          done();
        });
      }
    });
  });
};

const getContent = (path) => {
  return execute([{
    name: 'fs_nodes_get',
    text: 'SELECT content FROM fs_nodes WHERE path = $1',
    values: [path],
  }]);
};

const put = (path, content) => {
  return execute([
    {
      name: 'fs_nodes_put',
      text: 'INSERT INTO fs_nodes (path, content) VALUES ($1, $2) ' +
        'ON CONFLICT(path) DO UPDATE SET content = $2', // requires pg 9.5+
      values: [path, content],
    },
  ]);
};

module.exports = {
  getContent,
  put,
};
