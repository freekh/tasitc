const contains = (form) => {
  return ($) => {
    return Promise.resolve({
      mime: 'application/json',
      status: 200,
      content: $.content.indexOf(form($).content) !== -1,
    });
  };
};

module.exports = contains;
