// const app = require('./app');
// const env = require('./env');

// const pg = require('pg').native;

// app(env, pg).listen(env.port);

const express = require('express');

const app = express();

app.get('/div', (req, res) => {
  console.log('div!', req.path);
  res.send('<div>o</div>');
});

app.listen(8080);
