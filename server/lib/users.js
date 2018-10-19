const firestore = require('./firestore');
const ucdApi = require('./ucd-iam-api');
const orcidApi = require('./orcid-api');
const logger = require('./logger');
const config = require('../config');

/**
 * @class Users
 * @description Model for interacting with application users.
 */
class Users {

  /**
   * @method getUser
   * @description given a user casId return all information we have stored
   * from both ORCiD and UCD
   * 
   * @param {String} casId Users casId
   * 
   * @returns {Promise} resolves to {Object} 
   */
  async getUser(casId, includeToken=false) {
    let user = await firestore.getUser(casId);

    if( user && includeToken === false && user.orcidAccessToken ) {
      user.orcidUsername = user.orcidAccessToken.username;
      user.orcidAccessToken = true;
    }

    return user || {};
  }

  /**
   * @method revokeToken
   * @description revoke token from a given casId
   * 
   * @param {String} casId Users casId
   */
  async revokeToken(casId) {
    let user = await firestore.getUser(casId);
    if( !user.orcidAccessToken ) throw new Error('User does not have an access token');
    let response = await orcidApi.revokeToken(user.orcidAccessToken.access_token);
    if( response.statusCode !== 200 ) {
      throw new Error(response.body);
    }

    await firestore.updateUser(user.id, {
      orcidAccessToken : firestore.FieldValue.delete(),
      linked : false
    });
  }

  /**
   * @method clearUserLinkage
   * @description delete the orcidAccessToken field for user and set 
   * 'linked' flag to false
   * 
   * @param {String} id UCD CAS ID
   * 
   * @return Promise
   */
  clearUserLinkage(id) {
    return firestore.updateUser(id, {
      orcidAccessToken : firestore.FieldValue.delete(),
      linked : false
    });
  }

  /**
   * @method isLinked
   * @description has a user account ORCiD credentials been linked to a UCD
   * 
   * @param {String} orcid Users ORCiD 
   * 
   * @returns {Promise} resolves to {Boolean}
   */
  async isLinked(casId) {
    let user = await this.getUser(casId);
    return user.linked ? true : false;
  }

  /**
   * @method linkAccounts
   * @description given a users UCD CAS id and ORCiD, set the linked flag
   * in the db along with the users UCD information.
   * 
   * @param {String} casId Users UCD CAS id
   * @param {String} orcid Users ORCiD
   * 
   * @return {Promise} resolves to user information {Object}
   */
  async linkAccounts(casId) {
    // let ucdInfo = await this.getUcdInfo(casId);

    return firestore.setUser({
      id: casId,
      linked : true
    });
  }

  /**
   * @method syncUcd
   * @description resync all UCD user data to firebase and return UCD user data
   * 
   * @param {String} casId users UCD CAS id
   * 
   * @returns {Promise} resolves to {Object}
   */
  async syncUcd(casId) {
    let ucdInfo = await this.getUcdInfo(casId);
    await firestore.setUser({
      id: casId,
      ucd : ucdInfo
    });
    return ucdInfo;
  }

  /**
   * @method _addEmployment
   * @description given a user object, check that the employment information is correct. Currently
   * this is done by verifing that this application has set the correct ringgold identifier in
   * the users ORCiD record
   * 
   * @param {Object} user applications user object
   * @param {Array} messages array of message updates that have been performed
   * @param {String} token Users ORCiD access token
   * 
   * @return {Promise}
   */
  async _addEmployment(user, messages, token) {
    // currently we are just grabbing the first department for a user
    // TODO: this will become a user dropdown selection
    let department = user.ucd.department;
    if( Array.isArray(department) ) department = department[0];

    // if there is a odr title, use that instead.  They are normally better
    // TODO: this will most likely be part of user selection above (perhaps default option)
    if( user.ucd.departmentOdr )  {
      department.titleDisplayName = user.ucd.departmentOdr.titleDisplayName;
    }

    // grab start date, role and department name
    let startDate = new Date(department.assocStartDate);
    let roleTitle = department.titleDisplayName;
    let deptName = department.deptDisplayName;

    let employmentSummary = user.orcid['activities-summary'].employments['employment-summary'];
    let ringgoldIds = [];

    // find all employments that have ringgold ids and store the id as well as the source
    (employmentSummary || []).forEach(e => {
      if( e.organization['disambiguated-organization']['disambiguation-source'] === 'RINGGOLD' ) {
        ringgoldIds.push({
          id : e.organization['disambiguated-organization']['disambiguated-organization-identifier'],
          source : (e.source['source-name'] || {}).value
        });
      }
    });

    // find the main ucd ringgold id from the config file
    // this is the one w/o a department code
    let ucdCode = '';
    for( let key in config.ringgold.ucd ) {
      if( config.ringgold.ucd[key].ucdDeptCode === '' ) {
        ucdCode = key;
        break;
      }
    }

    // find the application set ucd ringgold employment record
    let ucdRinggold = ringgoldIds.find(e => {
      return (
        e.id === ucdCode &&
        e.source === config.ringgold.sourceName
      )
    });

    // if they don't have a UCD set ringgold employment record, create one
    // from the users UCD information
    if( !ucdRinggold ) {
      let response = await orcidApi.addEmployment(
        user.id,
        {
          'department-name' : deptName,
          organization : {
            address : {region: 'CA', city: 'Davis', country: 'US'},
            'disambiguated-organization' : {
              'disambiguated-organization-identifier' : ucdCode,
              'disambiguation-source': 'RINGGOLD'
            },
            name : config.ringgold.ucd[ucdCode].value
          },
          'role-title' : roleTitle,
          'start-date' : orcidApi.dateToOrcidDate(startDate)
        },
        token
      );
      if( response.statusCode !== 201 ) {
        logger.error('Failed to add UC Davis Employment', response.statusCode, response.body);
        messages.push('Failed to add UC Davis Employment');
      } else {
        messages.push('Added UC Davis Employment');
      }      
    }
  }

  /**
   * @method getUcdInfo
   * @description the UCD information stored for a user comes from multiple UCD API's.  This 
   * method wraps up all calls to these APIs and returns a single object. 
   * 
   * @param {String} id this should be the users UCD CAS ID
   * @param {Boolean} isIamId if the provided id is actually the UCD IAM ID, set this flag to true 
   */
  async getUcdInfo(id, isIamId=false) {
    let casId = isIamId ? await ucdApi.getCasId(id) : id;
    let iamId = isIamId ? id : await ucdApi.getIamId(id);

    let name = await ucdApi.getNameInfo(iamId);
    let contact = await ucdApi.getContactInfo(iamId);
    let affiliations = await ucdApi.getAffiliations(iamId);
    let department = await ucdApi.getDepartmentInfo(iamId);
    let departmentOdr = await ucdApi.getDepartmentInfoOdr(iamId);

    let departmentApp = [];
    if( name && name.ppsId ) {
      departmentApp = await firestore.getUserAppDepartments(name.ppsId);
    }

    // let dept = Array.isArray(department) ? department[0] : '';
    // let organization = await ucdApi.getOrgInfo(dept.bouOrgOId);

    let data = {name, iamId, casId, contact, department, departmentOdr, departmentApp, affiliations};
    return data;
  }

  /**
   * @method updateOrcidInfo
   * @description pull user record from ORCiD and store in db
   * 
   * @param {String} orcid Users ORCiD
   * @param {String} casId Users CAS ID
   * @param {String} token Users ORCiD access token
   * 
   * @returns {Promise} resolves to user {Object}
   */
  async updateOrcidInfo(orcid, casId, token) {
    let info = orcidApi.getResultObject(
      await orcidApi.get(orcid, token.access_token)
    );

    // TODO: kill any access token user already has

    return firestore.setUser({
      id: casId,
      orcid: info,
      orcidAccessToken : token
    });
  }

}

module.exports = new Users();