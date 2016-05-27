module.exports = (url, data) => {
  const formData = new FormData(); // http://caniuse.com/#feat=xhr2
  Object.keys(data).forEach(key => {
    formData.append(key, data[key]);
  });
  const req = new XMLHttpRequest();
  req.open('POST', url);
  const promise = new Promise((resolve, reject) => {
    req.onload = resolve;
    req.onerror = reject;
  });
  req.send(formData);
  return promise;
};
