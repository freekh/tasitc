const express = require('express');

const term = require('./routers/term');
const nodeStructure = require('./routers/node-structure');

const app = express();

app.use('/', nodeStructure);
app.use('/', term);

app.listen(8080);
