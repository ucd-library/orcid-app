const request = require('./request');
const config = require('../config');

class OrcidApi {

  constructor() {
    this.serverAccessToken = '';
  }

  setServerAccessToken(token) {
    this.serverAccessToken = token;
  }

  /**
   * @method generateToken
   * @description creates a oauth access token, this is a long living token so keep it secret,
   * keep it safe.
   * 
   * http://members.orcid.org/api/tutorial/read-orcid-records#gettoken
   * 
   * @param {Object} options
   * @param {String} options.scope Oauth scope. Options: /read-public, /person/update, /activities/update
   * @param {String} options.code if verify code returned from Oauth dance
   * 
   * @returns {Promise} resolves to response
   */
  generateToken(options) {
    let form = {
      client_id : config.orcid.clientId,
      client_secret : config.orcid.clientSecret,
      grant_type : options.grant_type
    }

    if( options.code ) form.code = options.code;
    if( options.scope ) form.scope = options.scope;

    return request(
      `${config.orcid.oauthBaseUrl}/token`,
      {
        method : 'POST',
        headers : {
          accept : 'application/json'
        },
        form
      }
    );
  }

  /**
   * @method revokeToken
   * @description revoke a ORCiD access token.
   * 
   * https://members.orcid.org/api/oauth/revoke-tokens
   * 
   * @param {String} token ORCiD access or refresh token
   * 
   * @returns {Promise}
   */
  revokeToken(token) {
    let form = {
      client_id : config.orcid.clientId,
      client_secret : config.orcid.clientSecret,
      token
    }

    return request(
      `${config.orcid.oauthBaseUrl}/revoke`,
      {
        method : 'POST',
        headers : {
          accept : 'application/json'
        },
        form
      }
    );
  }
 
  /**
   * @method search
   * @description search ORCID registry
   * http://members.orcid.org/api/tutorial/search-orcid-registry
   * 
   * @param {String} q
   * @param {Number} start
   * @param {Number} rows
   * 
   * @returns {Promise} resolves to response
   */
  search(q='', start=0, rows=10, token) {
    return this._request(
      config.orcid.api.baseUrl+'/search',
      {
        headers : {
          accept : 'application/vnd.orcid+json'
        },
        qs : {q, start, rows}
      },
      token
    );
  }

  /**
   * @method get
   * @description get a member by id
   * 
   * @param {String} id 
   * @param {String} token Optional
   * 
   * @returns {Promise} resolves to response
   */
  get(id, token) {
    return this._request(
      `${config.orcid.api.baseUrl}/${id}/record`,
      {
        headers : {
          accept : 'application/vnd.orcid+json'
        }
      },
      token
    );
  }

  /**
   * @method addEmployment
   * @description Add employment entry to user record.  User access token required
   * 
   * http://members.orcid.org/api/tutorial/update-orcid-records#3add
   * https://github.com/ORCID/ORCID-Source/blob/master/orcid-model/src/main/resources/record_2.0/samples/write_sample/employment-2.0.xml
   * 
   * @param {Object} data employment object
   * @param {String} token Required (from Oauth dance)
   * 
   * @returns {Promise} resolves to response
   */
  addEmployment(id, data, token) {
    return this._request(
      `${config.orcid.api.baseUrl}/${id}/employment`,
      {
        method : 'POST',
        headers : {
          'content-type' : 'application/vnd.orcid+json'
        },
        body : JSON.stringify(data)
      },
      token
    );
  }

  /**
   * @method updateEmployment
   * @description Add employment entry to user record.  User access token required
   * 
   * http://members.orcid.org/api/tutorial/update-orcid-records#4update
   * 
   * @param {String} putCode from existing employment object
   * @param {String} id user orcid
   * @param {Object} data new employment object
   * @param {String} token Required (from Oauth dance)
   * 
   * @returns {Promise} resolves to response
   */
  updateEmployment(putCode, id, data, token) {
    return this._request(
      `${config.orcid.api.baseUrl}/${id}/employment/${putCode}`,
      {
        method : 'PUT',
        headers : {
          'Accept' : 'application/json',
          'Content-type' : 'application/vnd.orcid+json'
        },
        body : JSON.stringify(data)
      },
      token
    );
  }

    /**
   * @method deleteEmployment
   * @description Delete employment entry to user record.  User access token required
   * 
   * http://members.orcid.org/api/tutorial/update-orcid-records#5delete
   * 
   * @param {String} putCode from existing employment object
   * @param {String} id user orcid
   * @param {String} token Required (from Oauth dance)
   * 
   * @returns {Promise} resolves to response
   */
  deleteEmployment(putCode, id, token) {
    return this._request(
      `${config.orcid.api.baseUrl}/${id}/employment/${putCode}`,
      {
        method : 'DELETE'
      },
      token
    );
  }

  /**
   * @method dateToOrcidDate
   * @description convert JavaScript Date object to orcid date object
   * 
   * @param {Object} date JavaScript Date
   * 
   * @returns {Object} orcid date format
   */
  dateToOrcidDate(date) {
    let day = date.getDate();
    if( day < 10 ) day = '0'+day;
    let month = date.getMonth()+1;
    if( month < 10 ) month = '0'+month;

    return {
      day : {value : day+''},
      month : {value : month+''},
      year : {value : date.getFullYear()+''}
    }
  }

  getResultObject(response) {  
    try {
      response = JSON.parse(response.body);
    } catch(e) {
      response = response.body;
    }

    return response;
  }

  /**
   * @method _request
   * @description private wrapper around request to append Bearer authorization
   * (access) token if provided to class
   * 
   */
  _request(uri, options = {}, token) {
    if( this.serverAccessToken || token ) {
      if( !options.headers ) options.headers = {};
      options.headers.authorization = `Bearer ${token || this.serverAccessToken}`;
    }

    return request(uri, options);
  }

}

module.exports = new OrcidApi();