const text = (form) => {
  return ($) => {
    const content = $.content instanceof Array ? $.content.join('') : String($.content);

    return form({
      status: 200,
      mime: 'text/plain',
      content,
    });
  };
};

module.exports = text;
