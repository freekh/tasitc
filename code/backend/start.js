const app = require('./app');
const env = require('./env');

app('./ns/').listen(env.port);
