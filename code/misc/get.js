module.exports = (url) => {
  const req = new XMLHttpRequest();
  req.open('GET', url);
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
  req.send();
  return promise;
};
