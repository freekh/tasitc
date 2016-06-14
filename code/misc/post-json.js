const xhr2 = require('xhr2');

module.exports = (url, data) => {
  let XHR = null;
  // FIXME: ugly hack
  if (typeof window === 'undefined') {
    XHR = xhr2;
    url = 'http://localhost:8080'+ url; // :___(
  } else {
    XHR = XMLHttpRequest;
  }
  const req = new XHR();
  req.open('POST', url);
  req.setRequestHeader('Content-Type', 'application/json');
  const promise = new Promise((resolve, reject) => {
    req.onload = () => {
      const mime = req.getResponseHeader('Content-Type');
      let content = req.responseText;
      if (mime.indexOf('application/json') !== -1) {
        content = JSON.parse(content);
      }
      resolve({
        status: req.status,
        mime,
        content,
      });
    };
    req.onerror = err => {
      reject(err);
    };
  });
  req.send(JSON.stringify(data));
  return promise;
};
