module.exports = (url, data) => {
  const formData = new FormData(); // http://caniuse.com/#feat=xhr2
  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });
  const req = new XMLHttpRequest();
  req.open('POST', url);
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
  req.send(formData);
  return promise;
};
