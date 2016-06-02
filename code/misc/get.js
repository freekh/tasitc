module.exports = (url) => {
  const req = new XMLHttpRequest();
  req.open('GET', url);
  const promise = new Promise((resolve, reject) => {
    req.onload = resolve;
    req.onerror = reject;
  });
  req.send();
  return promise;
};
