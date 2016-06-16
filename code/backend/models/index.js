const nsNode = require('./ns-node');

module.exports = (pg, pgConnectionString) => {
  return {
    NsNode: nsNode(pg, pgConnectionString),
  };
};
