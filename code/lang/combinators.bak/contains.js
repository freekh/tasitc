const contains = (form) => {
  return ($) => {
    if ($.content && $.content.indexOf) {
      return Promise.resolve({
        mime: 'application/json',
        status: 200,
        content: $.content.indexOf(form($).content) !== -1,
      });
    }
    return Promise.reject({
      mime: 'text/plain',
      status: 500,
      content: `It is not possible check if contains on: ${JSON.stringify($)}`,
    });
  };
};

module.exports = contains;
