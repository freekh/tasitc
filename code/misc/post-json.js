module.exports = (url, data) => {
  const req = new XMLHttpRequest();
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
    req.onerror = reject;
  });
  req.send(JSON.stringify(data));
  return promise;
};
