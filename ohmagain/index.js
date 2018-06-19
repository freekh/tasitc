const fs = require('fs');
const ohm = require('ohm-js');

const contents = fs.readFileSync('meta.ohm');
const input = fs.readFileSync('meta.grammar');
const grammar = ohm.grammar(contents);


const m = grammar.match(input);
if (m.succeeded()) {
  console.log(':+1:');
} else {
  console.log('Oops');
}