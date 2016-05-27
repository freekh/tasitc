const sass = require('node-sass');

module.exports = (file) => {
  return new Promise((resolve, reject) => {
    sass.render({
      file,
    }, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result.css);
      }
    });
  });
};
