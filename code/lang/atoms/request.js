
const request = (promisedPath, argRaw, env) => {
  const promisedArg = argRaw instanceof Promise ?
          argRaw : Promise.resolve(argRaw);

  return Promise.all([promisedPath, promisedArg]).then(([pathResponse, argResponse]) => {
    if (argResponse && argResponse.status !== 200) { // TODO: could be different than 200
      return Promise.reject({
        status: 404,
        mime: 'text/plain',
        content: `Malformed argument ${JSON.stringify(argResponse)}`,
      });
    }
    // FIXME:
  });
};

module.exports = request;
