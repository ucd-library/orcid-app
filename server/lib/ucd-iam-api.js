const request = require('./request');
const config = require('../config');

// console.log(config.ucd.api);

// https://ucdavis.jira.com/wiki/spaces/IETP/pages/132808721/Web+Service+API
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
          Accept : 'application/json'
        },
        qs : {
          userId : casId,
          key : config.ucd.api.key,
          v : config.ucd.api.version
        }
      } 
    );

    response = this._getResponse(response, 'userId', casId);
    return response.iamId;
  }

  /**
   * @method getContactInfo
   * @description given a users ucd iam id, return their contact info
   * 
   * @param {String} iamId
   * 
   * @returns {Promise} resolves to object or null
   */
  async getContactInfo(iamId) {
    let response = await request(
      `${config.ucd.api.baseUrl}/people/contactinfo/${iamId}`, 
      {
        headers : {
          Accept : 'application/json'
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
          Accept : 'application/json'
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
  async getDepartmentInfo(iamId) {
    // quinn had below but can't find docs and doesn't seem to return for jrmerz
    // /associations/odr/

    let response = await request(
      `${config.ucd.api.baseUrl}/associations/pps/${iamId}`, 
      {
        headers : {
          Accept : 'application/json'
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
   * @method getDepartmentInfoOdr
   * @description given ucd iam id return department information
   * 
   * @param {String} iamId
   * 
   * @returns {Promise} resolves to Object or null
   */
  async getDepartmentInfoOdr(iamId) {
    // quinn had below but can't find docs and doesn't seem to return for jrmerz
    // /associations/odr/

    let response = await request(
      `${config.ucd.api.baseUrl}/associations/odr/${iamId}`, 
      {
        headers : {
          Accept : 'application/json'
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
      throw new Error(`Error accessing UCD iam API (${response.statusCode}): ${response.body}`);
    }

    let body = JSON.parse(response.body);
    if( !body.responseData.results ) return null;

    for( let result of body.responseData.results ) {
      if( result[idParam] === id ) {
        return result;
      }
    }

    return null;
  }

}

module.exports = new UcdiamApi();