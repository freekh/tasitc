module.exports = (url, body) => {
  const req = new XMLHttpRequest();
  req.open('POST', url);
  const promise = new Promise((resolve, reject) => {
    req.onload = resolve;
    req.onerror = reject;
  });
  req.send(body);
  return promise;
};
