const request = require('./request');
const config = require('../config');

/**
 * @class UcdiamApi
 * @description static class for calling UCD IAM API
 * docs: https://ucdavis.jira.com/wiki/spaces/IETP/pages/132808721/Web+Service+API
 */
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
   * @method getCasId
   * @description given a users IAM id, return their cas id
   * 
   * @param {String} iamId
   * 
   * @returns {Promise} resolves to String or null
   */
  async getCasId(iamId) {
    let response = await request(
      `${config.ucd.api.baseUrl}/people/prikerbacct/${iamId}`, 
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

    response = this._getResponse(response, 'iamId', iamId);
    return response.userId;
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
   * @method getIamFromEmail
   * @description given a users email address, return their UCD IAM ID
   * 
   * @param {String} email
   * 
   * @returns {Promise} resolves to String
   */
  async getIamFromEmail(email) {
    let response = await request(
      `${config.ucd.api.baseUrl}/people/contactinfo/search`, 
      {
        headers : {
          Accept : 'application/json'
        },
        qs : {
          email,
          key : config.ucd.api.key,
          v : config.ucd.api.version
        }
      } 
    );

    response = this._getResponse(response, 'email', email);
    if( !response ) return null;
    
    if( Array.isArray(response) ) {
      if( response.length === 0 ) return null;
      response = response[0];
    }

    return response.iamId;
  }

  async getAffiliations(iamId) {
    let response = await request(
      `${config.ucd.api.baseUrl}/people/affiliations/${iamId}`, 
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
   * @method getOrgInfo
   * @description 
   * 
   * @param {String} iamId
   * 
   * @returns {Promise} resolves to object or null
   */
  async getOrgInfo(deptId) {
    let response = await request(
      `${config.ucd.api.baseUrl}/orginfo/pps/depts/search`, 
      {
        headers : {
          Accept : 'application/json'
        },
        qs : {
          key : config.ucd.api.key,
          v : config.ucd.api.version,
          deptCode : deptId
        }
      } 
    );

    return this._getResponse(response, 'deptCode', deptId);
  }

    /**
   * @method getOrgInfo
   * @description 
   * 
   * @param {String} iamId
   * 
   * @returns {Promise} resolves to object or null
   */
  async getOdrOrgInfo(deptId) {
    let response = await request(
      `${config.ucd.api.baseUrl}/orginfo/odr/depts/search`, 
      {
        headers : {
          Accept : 'application/json'
        },
        qs : {
          key : config.ucd.api.key,
          v : config.ucd.api.version,
          deptCode : deptId
        }
      } 
    );

    return this._getResponse(response, 'deptCode', deptId);
  }

  async getOdrDivisions(orgId) {
    let response = await request(
      `${config.ucd.api.baseUrl}/orginfo/odr/divisions/search`, 
      {
        headers : {
          Accept : 'application/json'
        },
        qs : {
          key : config.ucd.api.key,
          v : config.ucd.api.version,
          orgOId : orgId
        }
      } 
    );

    return this._getResponse(response, 'orgOId', orgId);
  }

  /**
   * @method getColleges
   * @description 
   * 
   * @returns {Promise} resolves to object or null
   */
  async getColleges(orgId) {
    let response = await request(
      `${config.ucd.api.baseUrl}/orginfo/sis/colleges/search`, 
      {
        headers : {
          Accept : 'application/json'
        },
        qs : {
          key : config.ucd.api.key,
          v : config.ucd.api.version,
          orgOId : orgId
        }
      } 
    );

    return this._getResponse(response, 'orgOId', orgId);
  }

  async getDivisions(orgId) {
    let response = await request(
      `${config.ucd.api.baseUrl}/orginfo/pps/divisions/search`, 
      {
        headers : {
          Accept : 'application/json'
        },
        qs : {
          key : config.ucd.api.key,
          v : config.ucd.api.version,
          orgOId : orgId
        }
      } 
    );

    return this._getResponse(response, 'orgOId', orgId);
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

    let results = [];
    for( let result of body.responseData.results ) {
      if( result[idParam] === id ) {
        results.push(result);
      }
    }

    if( results.length > 1 ) return results;
    if( results.length === 1 ) return results[0];

    return null;
  }

}

module.exports = new UcdiamApi();