const iterable = require('./iterable');

const map = (form) => {
  return ($) => {
    const content = iterable($.content);
    if (content.map) {
      return Promise.all(content.map(content => {
        return form({
          mime: $.mime,
          status: $.status,
          content,
        });
      })).then(responses => {
        return {
          status: $.status,
          mime: $.mime,
          content: responses.map(r => {
            return r.content;
          }),
        };
      });
    }
    return Promise.reject({
      status: 500,
      mime: 'text/plain',
      content: `Cannot compose (map) ${JSON.stringify($.content)}`,
    });
  };
};

module.exports = map;
