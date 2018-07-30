const request = require('request');

/**
 * @method request
 * @description promise wrapper around request library
 * 
 * @param {String} uri
 * @param {Object} options 
 * 
 * @returns {Promise}
 */
module.exports = (uri, options) => {
  return new Promise((resolve, reject) => {
    request(uri, options, (error, response) => {
      if( error ) reject(error);
      else resolve(response);
    });      
  });
}