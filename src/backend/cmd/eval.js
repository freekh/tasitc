'use strict'

module.exports = (data) => {
  let result = null
  try {
    result = eval(data.join(' ')) //TODO: this is NOT safe of course
  } catch (ex) {
    console.log(ex)
  }
  return {
    result
  }
}
