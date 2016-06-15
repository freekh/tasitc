const xhr2 = require('xhr2');

// FIXME: this needs a bit of work: server side code mixed into client, etc etc
module.exports = (url, options) => {
  const { type, data, mime } = options;
  let XHR = null;
  // FIXME: ugly hack
  if (typeof window === 'undefined') {
    XHR = xhr2;
  } else {
    XHR = XMLHttpRequest;
  }
  const req = new XHR();
  req.open(type, url);
  req.setRequestHeader('Content-Type', mime);
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
  if (type === 'POST') {
    if (mime.indexOf('application/json' !== -1)) {
      req.send(JSON.stringify(data));
    } else {
      req.send(data);
    }
  } else {
    req.send();
  }

  return promise;
};
