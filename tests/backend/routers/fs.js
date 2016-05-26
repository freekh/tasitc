const { testable } = require('../../../code/backend/routers/fs');

const promise = testable.write(0, 1, 2);

while (true) { //TODO;
  console.log(promise);
}
