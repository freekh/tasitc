const express = require('express');
const path = require('path');

const tux = require('./routers/tux');
const fs = require('./routers/fs');

const app = express();

app.use('/assets', express.static(path.resolve('./assets')));

app.use('/', tux);
app.use('/', fs);

app.listen(8080);
