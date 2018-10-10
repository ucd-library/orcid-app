const config = require('../config');
const firestore = require('./firestore');

/**
 * @class AuthUtils
 * @description static class of authentication utils
 */
class AuthUtils {

  /**
   * @method loadAdmins
   * @description load application admins.  this should be called when the app loads
   * 
   * @returns {Promise}
   */
  async loadAdmins() {
    this.admins = await firestore.getAdmins();
  }

  /**
   * @method isAdmin
   * @description is the given ORCiD and application admin
   * 
   * @param {String} orcid 
   * 
   * @returns {Promise} resolves to {Boolean}
   */
  async isAdmin(orcid) {
    if( !this.admins ) {
      await this.loadAdmins();
    }

    return (this.admins.indexOf(orcid) > -1) ? true : false;
  }

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