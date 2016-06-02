module.exports = (url, data) => {
  const formData = new FormData(); // http://caniuse.com/#feat=xhr2
  Object.keys(data).forEach(key => {
     // FIXME: this is BS, is formdata really necessary - how about pure json instead?
    const value = data[key] instanceof Object ? JSON.stringify(data[key]) : data[key];
    formData.append(key, value);
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
