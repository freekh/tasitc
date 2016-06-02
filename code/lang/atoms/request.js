const h = require('hyperscript');


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

const request = (promisedPath, argRaw) => {
  const promiseArg = argRaw instanceof Promise ?
          argRaw : Promise.resolve(argRaw);

  return Promise.all([promisedPath, promiseArg]).then(([pathResponse, argResponse]) => {
    if (argResponse && argResponse.status !== 200) { // TODO: could be different than 200
      return Promise.reject({
        status: 404,
        mime: 'text/plain',
        content: `Malformed argument ${JSON.stringify(argResponse)}`,
      });
    }
    const arg = argResponse ? argResponse.content : '';
    const path = pathResponse.content; // TODO: check status
    let content = '';
    let mime = 'text/plain';
    if (path === '/tasitc/dom/html') {
      content = responseToHyperscript('html', argResponse).outerHTML;
      mime = 'text/html';
    } else if (path === '/tasitc/dom/ul') {
      content = responseToHyperscript('ul', argResponse).outerHTML;
      mime = 'text/html';
    } else if (path === '/tasitc/dom/body') {
      content = responseToHyperscript('body', argResponse).outerHTML;
      mime = 'text/html';
    } else if (path === '/tasitc/dom/head') {
      content = responseToHyperscript('head', argResponse).outerHTML;
      mime = 'text/html';
    } else if (path === '/tasitc/dom/style') {
      content = responseToHyperscript('style', argResponse).outerHTML;
      mime = 'text/html';
    } else if (path === '/tasitc/dom/li') {
      content = responseToHyperscript('li', argResponse).outerHTML;
      mime = 'text/html';
    } else if (path === '/tasitc/dom/div') {
      content = responseToHyperscript('div', argResponse).outerHTML;
      mime = 'text/html';
    } else if (path === '/tasitc/ns/ls') {
      mime = 'application/json';
      content = [{ path: 'ab' }, { path: 'cd' }, { path: 'ef' }];
    } else {
      return Promise.reject({
        status: 404,
        content: `Could not find/execute: ${JSON.stringify(path)}`,
        mime: 'text/plain',
      });
    }
    return Promise.resolve({
      status: 200,
      content,
      mime,
    });
  });
};

module.exports = request;
