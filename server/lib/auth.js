const config = require('../config');

class AuthUtils {

  /**
   * @method getUserFromRequest
   * @description helper method. given a express request, return object containing cas and
   * orcid session information.
   * 
   * @param {Object} req express request
   * 
   * @returns {Object}
   */
  getUserFromRequest(req) {
    return {
      cas : req.session[config.ucd.cas.sessionName],
      orcid : req.session[config.orcid.sessionName]
    }
  }

}

module.exports = new AuthUtils();