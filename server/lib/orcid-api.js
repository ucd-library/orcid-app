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
   * keep it safe.  TODO: figure out if we can void these tokens via API.
   * 
   * http://members.orcid.org/api/tutorial/read-orcid-records#gettoken
   * 
   * @returns {Promise} resolves to JSON response
   */
  async generateToken() {
    let response = await request(
      config.env === 'prod' ? 'https://orcid.org/oauth/token' : 'https://sandbox.orcid.org/oauth/token',
      {
        method : 'POST',
        headers : {
          accept : 'application/json'
        },
        form : {
          client_id : config.orcid.clientId,
          client_secret : config.orcid.clientSecret,
          grant_type : 'client_credentials',
          scope : '/read-public'
        }
      }
    );

    return JSON.parse(response.body);
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
   * @returns {Promise} resolves to JSON
   */
  async search(q='', start=0, rows=10, token) {
    let response = await this._request(
      config.orcid.api.baseUrl+'/search',
      {
        headers : {
          accept : 'application/vnd.orcid+json'
        },
        qs : {q, start, rows}
      },
      token
    );

    return JSON.parse(response.body);
  }

  async get(id, token) {
    let response = await this._request(
      `${config.orcid.api.baseUrl}/${id}/record`,
      {
        headers : {
          accept : 'application/vnd.orcid+json'
        }
      }
    );

    return JSON.parse(response.body);
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