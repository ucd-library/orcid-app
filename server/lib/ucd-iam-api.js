const request = require('./request');
const config = require('../config');

class UcdiamApi {

  /**
   * @method getIamId
   * @description given a users CAS id, return their iam id
   * 
   * @param {String} casId
   * 
   * @returns {Promise} resolves to String or null
   */
  async getIamId(casId) {
    let response = await request(
      `${config.ucd.api.baseUrl}/people/prikerbacct/search`, 
      {
        headers : {
          Accept : 'application/javascript'
        },
        qs : {
          userId : casId,
          key : config.ucd.api.key,
          v : config.ucd.api.version
        }
      } 
    );

    return this._getResponse(response, 'userId', casId);
  }

  /**
   * @method getContactInfo
   * @description given a users ucd iam id, return their contact info
   * 
   * @param {String} iamId
   * 
   * @returns {Promise} resolves to object or null
   */
  getContactInfo(iamId) {
    let response = request(
      `${config.ucd.api.baseUrl}/people/contactinfo/${iamId}`, 
      {
        headers : {
          Accept : 'application/javascript'
        },
        qs : {
          key : config.ucd.api.key,
          v : config.ucd.api.version
        }
      } 
    );

    return this._getResponse(response, 'iamId', iamId);
  }

  /**
   * @method getNameInfo
   * @description given a users ucd iam id fetch their name info from
   * the core api.
   * 
   * @param {String} iamId
   * 
   * @returns {Promise} resolves to object or null
   */
  async getNameInfo(iamId) {
    let response = await request(
      `${config.ucd.api.baseUrl}/people/search`, 
      {
        headers : {
          Accept : 'application/javascript'
        },
        qs : {
          iamId : iamId,
          key : config.ucd.api.key,
          v : config.ucd.api.version
        }
      } 
    );

    return this._getResponse(response, 'iamId', iamId);
  }

  /**
   * @method getDepartmentInfo
   * @description given ucd iam id return department information
   * 
   * @param {String} iamId
   * 
   * @returns {Promise} resolves to Object or null
   */
  getDepartmentInfo(iamId) {
    let response = request(
      `${config.ucd.api.baseUrl}/associations/odr/${iamId}`, 
      {
        headers : {
          Accept : 'application/javascript'
        },
        qs : {
          key : config.ucd.api.key,
          v : config.ucd.api.version
        }
      } 
    );

    return this._getResponse(response, 'iamId', iamId);
  }

  _getResponse(response, idParam, id) {
    if( response.statusCode !== 200 ) {
      throw new Error('Error accessing UCD iam API');
    }
    let body = JSON.parse(response.body);

    for( let result of body.responseData.results ) {
      if( result[idParam] === id ) {
        return result;
      }
    }

    return null;
  }

}

module.exports = new UcdiamApi();