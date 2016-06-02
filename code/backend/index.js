const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const term = require('./routers/term');
const nodeStructure = require('./routers/node-structure');

const jsonBody = bodyParser.json();
const app = express();

app.use('/', nodeStructure);

app.use('/', term);
app.use('/tasitc/term/assets', express.static(path.resolve('./assets')));

// FIXME: remove:
app.post('/tasitc/ns/ls', jsonBody, (req, res) => {
  console.log(req.body);
  res.json([{ path: 'hello.txt' }]);
});

app.listen(8080);
