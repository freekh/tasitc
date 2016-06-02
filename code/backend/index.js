const express = require('express');
const path = require('path');

const term = require('./routers/term');
const nodeStructure = require('./routers/node-structure');

const app = express();

app.use('/', nodeStructure);

app.use('/', term);
app.use('/tasitc/term/assets', express.static(path.resolve('./assets')));

app.listen(8080);
