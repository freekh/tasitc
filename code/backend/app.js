const express = require('express');

const term = require('./routers/term');
const nodeStructure = require('./routers/node-structure');

module.exports = (env, pg) => {
  const app = express();
  app.use('/', nodeStructure(pg, env.pgConnectionString));
  app.use('/', term);
  return app;
};
