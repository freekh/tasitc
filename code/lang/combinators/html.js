const html = (form) => {
  return ($) => {
    const content = $.content instanceof Array ? $.content.join('') : String($.content);

    return form({
      status: 200,
      mime: 'text/html',
      content: `<html>${content}</html>`,
    });
  };
};

module.exports = html;
