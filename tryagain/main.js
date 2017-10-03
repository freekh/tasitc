const fs = require('fs');
const { parse } = require('./parser');

// Hack
const stdin = fs.readFileSync(0).toString();

console.log(stdin);
console.log(JSON.stringify(parse(stdin), null, 1));
