const app = require('./app');
const env = require('./env');

const pg = require('pg').native;

app(env, pg).listen(env.port);
