const iterable = (init) => {
  let content = init;
  if (typeof content === 'string') {
    content = content.indexOf('\n') !== -1 ? content.split('\n') : content.split('');
  }
  return content;
};

module.exports = iterable;
