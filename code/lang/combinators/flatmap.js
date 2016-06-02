const iterable = require('./iterable');

const flatmap = (form) => {
  return ($) => {
    const content = iterable($.content);
    let flattened = null;
    if (content.reduce) {
      // TODO: not very efficient nor elegant (could flatten during mapping):
      flattened = content.reduce((listlike, value) => {
        if (listlike === null || value === null) {
          return null;
        }
        const listlikeIter = iterable(listlike);
        if (listlikeIter.concat) {
          return listlikeIter.concat(iterable(value));
        }
        return null;
      });
    }
    if (flattened && flattened.map) {
      return Promise.all(flattened.map(content => {
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
      content: `Cannot compose (flatmap) ${JSON.stringify($.content)}`,
    });
  };
};

module.exports = flatmap;
