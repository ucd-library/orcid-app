const firestore = require('./firestore');
const ucdApi = require('./ucd-iam-api');
const orcidApi = require('./orcid-api');
const appData = require('./app-data');
const logger = require('./logger');
const config = require('../config');

/**
 * @class Users
 * @description Model for interacting with application users.
 */
class Users {

  constructor() {
    // local division cache
    this.divisions = {};

    // org ringgold code lookup
    this.codeLabels = {
      [config.ringgold.ucd.code] : config.ringgold.ucd.label
    };
    for( let key in config.ringgold.appPartners ) {
      let p = config.ringgold.appPartners[key];
      this.codeLabels[config.ringgold.orgs[p.org]] = p.label;
    }
  }

  /**
   * @method getPublicProfileByUcdId
   * @description given an UCD id, either IAM, email or CAS, return a ORCiD record or
   * just the id
   * 
   * @param {String} id UCD id, either IAM, email or CAS, will auto detect
   * @param {Boolean} orcidOnly return only the String ORCiD iD
   * 
   * @returns {Promise} resolves to object or string
   */
  async getPublicProfileByUcdId(id, orcidOnly=false) {
    let collection = firestore.db.collection(config.firestore.collections.users);
    let user;
    let type = '';
    
    if( id.match(/^\d{10}$/) ) { // iam
      type = 'iam';
      let result = await collection.where('ucd.contact.iamId', '==', id).get();
      user = this._getFirstFromQueryRef(result);
    } else if( id.indexOf('@') > -1 ) { // email
      type = 'email';
      let result = await collection.where('ucd.contact.email', '==', id).get();
      user = this._getFirstFromQueryRef(result);
    } else { // cas
      type = 'cas';
      user = await this.getUser(id);
      if( Object.keys(user).length === 0 ) {
        user = null;
      } 
    }

    if( !user ) throw new Error('Unknown id: '+id+'.  Lookup method: '+type);

    if( orcidOnly ) {
      return {
        type,
        id: user.orcid['orcid-identifier'].path
      }
    }

    let response = await orcidApi.getPublic(user.orcid['orcid-identifier'].path);
    let body = response.body;
    try {
      body = JSON.parse(response.body);
    } catch(e) {
      body = {body}
    };
    
    return {
      type,
      body,
      statusCode : response.statusCode
    }
  }

  /**
   * @method _getFirstFromQueryRef
   * @description help method for firestore
   * TODO: move to firestore
   */
  _getFirstFromQueryRef(ref) {
    let data = [];
    ref.forEach(doc => {
      data.push(doc.data());
    });
    if( data.length === 0 ) return null;
    return data[0];
  }

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
   * @method getAndSyncUser
   * 
   * @description grab the most up to date version of a users record as possible.  This means
   * pulling from UCD and ORCiD. Will store result in FireStore and return data.  This should really
   * always be used over getUser :(
   * 
   * @param {String} casId 
   * @param {Boolean} includeToken include users access token?
   * @param {Boolean} waitOnWrite should the function wait on write to firestore or just continue
   * execution, returning user object possibly before write completes?
   * 
   * @returns {Promise} 
   */
  async getAndSyncUser(casId, includeToken=false, waitOnWrite=true) {
    // get current user information (we need the orcid access token)
    let user = await this.getUser(casId, true);
    if( !user ) return null;

    // grab current UCD information
    let ucd = await this.getUcdInfo(casId);
    user.ucd = ucd;

    // orcid information has not been set yet
    if( !user.orcid || !user.orcidAccessToken ) {
      if( waitOnWrite ) {
        await firestore.setUser({
          id: casId, ucd
        });
      } else {
        firestore.setUser({
          id: casId, ucd
        });
      }
     
      return user;
    }

    // grab current ORCiD information
    try {
      // TODO: add timeout option
      let response = await orcidApi.get(
        user.orcid['orcid-identifier'].path, 
        user.orcidAccessToken.access_token
      );
      let orcid = orcidApi.getResultObject(response);
  
      // update firestore
      if( waitOnWrite ) {
        await firestore.setUser({
          id: casId, orcid, ucd
        });
      } else {
        firestore.setUser({
          id: casId, orcid, ucd
        });
      }

      user.orcid = orcid;
    } catch(e) {
      logger.error('Failed to request ORCiD profile: '+user.orcid['orcid-identifier'].path, e);
    }
    
    // strip access token unless asked for
    if( user.orcidAccessToken ) {
      user.orcidUsername = user.orcidAccessToken.username;
      if( includeToken === false ) {
        user.orcidId = user.orcid['orcid-identifier'].path;
        user.orcidAccessToken = true;
      }
    } 
    
    return user || {};
  }

  /**
   * @method updateEmployments
   * @description update a users ORCiD record with given employments.  This will 
   * remove all existing employments for the UC Davis application and replace with 
   * the given list.
   * 
   * @param {String} casId
   * @param {Object[]} employments 
   * @param {String} employments[].title
   * @param {String} employments[].department
   * @param {String} employments[].code
   * @param {String} employments[].startDate
   */
  async updateEmployments(casId, employments = []) {
    // check for all fields
    employments.forEach((e, index) => {
      if( !e.code || !e.startDate ) {
        throw new Error(`Employment ${index} is missing required fields code or startDate`);
      } 
    });

    // grab current ORCiD information
    let user = await this.getUser(casId, true);
    let orcidId = user.orcid['orcid-identifier'].path;
    let accessToken = user.orcidAccessToken.access_token;
    let response = await orcidApi.get(orcidId, accessToken);
    let orcid = orcidApi.getResultObject(response);
    let currentEmployments = orcid['activities-summary'].employments['employment-summary'] || [];

    let messages = [];
    for( let e of currentEmployments ) {
      if( this._isAppSource(e.source) ) {
        let response = await orcidApi.deleteEmployment(e['put-code'], orcidId, accessToken);
        if( response.statusCode !== 204 ) {
          logger.fatal('Failed to remove UC Davis Employment', response.statusCode, response.body);
          messages.push({error: true, message: 'Failed to add UC Davis Employment'});
        } else {
          messages.push({success: true, message: 'Removed UC Davis Employment', code: e['put-code']});
        }
      }
    }

    for( let e of employments ) {
      let response = await orcidApi.addEmployment(
        orcidId,
        {
          'department-name' : e.department || null,
          organization : {
            address : {region: 'CA', city: 'Davis', country: 'US'},
            'disambiguated-organization' : {
              'disambiguated-organization-identifier' : e.code,
              'disambiguation-source': 'RINGGOLD'
            },
            name : this.codeLabels[e.code]
          },
          'role-title' : e.title || null,
          'start-date' : orcidApi.dateToOrcidDate(e.startDate)
        },
        accessToken
      );
  
      if( response.statusCode !== 201 ) {
        logger.fatal('Failed to add UC Davis Employment', response.statusCode, response.body);
        messages.push({errpor: true, message: 'Failed to add UC Davis Employment', employment: e});
      } else {
        messages.push({success: true, message: 'Added UC Davis Employment', employment: e});
      }
    }

    // update ORCiD local record
    response = await orcidApi.get(
      user.orcid['orcid-identifier'].path, 
      user.orcidAccessToken.access_token
    );
    orcid = orcidApi.getResultObject(response);
    await firestore.setUser({
      id: casId, orcid
    });

    return messages;
  }

  _isAppSource(source) {
    if( source && 
        source['source-client-id'] && 
        source['source-client-id'].path === config.orcid.sourceId ) {
      return true;
    }
    return false;
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
   * 
   * @return {Promise} resolves to user information {Object}
   */
  async linkAccounts(casId) {
    let user = await this.getUser(casId);
    if( !user.orcidAccessToken && user.orcidAccessToken.access_token ) {
      throw new Error('ORCiD account not set. Accounts cannot be linked');
    }

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
    
    let departmentPps = await ucdApi.getDepartmentInfo(iamId);
    if( departmentPps ) {
      if( !Array.isArray(departmentPps) ) {
        departmentPps = [departmentPps];
      }

      for( let dept of departmentPps ) {
        dept.appTitle = appData.getUserTitle(dept.titleOfficialName);
        // TODO: add apptBou first
        dept.division = await this.getDivisions(dept.apptBouOrgOId || dept.adminBouOrgOId || dept.bouOrgOId);
      }
    }

    let departmentOdr = await ucdApi.getDepartmentInfoOdr(iamId);
    let departmentApp = appData.getUserDepartments(iamId);

    // let dept = Array.isArray(department) ? department[0] : '';
    // let organization = await ucdApi.getOrgInfo(dept.bouOrgOId);

    return {
      name, 
      iamId, 
      casId, 
      contact, 
      departmentPps, 
      departmentOdr, 
      departmentApp, 
      affiliations
    };
  }

  /**
   * @method getDivisions
   * @description get the division inforation from the UCD IAM API but check a local
   * cache first.
   * 
   * @param {String} orgId
   */
  async getDivisions(orgId='') {
    if( this.divisions[orgId] ) {
      return this.divisions[orgId];
    }

    let division = await ucdApi.getDivisions(orgId);
    if( division ) {
      this.divisions[orgId] = division;
    }

    return division;
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
  async setOrcidInfo(orcid, casId, token) {
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