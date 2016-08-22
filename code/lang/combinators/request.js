const req = require('../../dev-utils/request');

const request = (argFun) => {
  return (ctx) => {
    const uri = argFun();
    return req(uri.value, { type: 'GET' }).then(data => {
      return data.content;
    });
  };
};

module.exports = request;
