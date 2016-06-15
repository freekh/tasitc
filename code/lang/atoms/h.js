const responseToHyperscript = (elemType, res) => {
  if (res.mime === 'text/plain') {
    return h(elemType, res.content);
  } else if (res.mime === 'application/json') {
    if (res.content instanceof Array) {
      const jsonContent = res.content.map(element => {
        if (typeof element === 'string') {
          return element;
        }
        return JSON.stringify(element);
      }).join('');
      const elem = h(elemType);
      elem.innerHTML = jsonContent;
      return elem;
    } else if (typeof res.content === 'string') {
      return h(elemType, res.content);
    } else if (res.content instanceof Object) {
      return h(elemType, res.content, []);
    }
    return res.content;
  } else if (res.mime === 'text/html') {
    const elem = h(elemType);
    elem.innerHTML = res.content;
    return elem;
  }
  return res.content.toString();
};
