const firestore = require('./firestore');
const ucdApi = require('./ucd-iam-api');
const orcidApi = require('./orcid-api');
const logger = require('./logger');
const config = require('../config');

class Users {

  getUser(orcid) {
    return firestore.getUser(orcid);
  }

  async isLinked(orcid) {
    let user = await this.getUser(orcid);
    return user.linked ? true : false;
  }

  async linkAccounts(casId, orcid) {
    let ucdInfo = await this.getUcdInfo(casId);

    return firestore.setUser({
      id: orcid,
      linked : true,
      ucd : ucdInfo
    });
  }

  async syncUcd(orcid, casId) {
    let ucdInfo = await this.getUcdInfo(casId);
    await firestore.setUser({
      id: orcid,
      ucd : ucdInfo
    });
    return ucdInfo;
  }

  async addUcdInfo(orcid, casId, token) {
    let updates = [];

    // always update user, we don't know what they have done...
    let record = JSON.parse((await orcidApi.get(orcid, token)).body);
    let ucd = await this.getUcdInfo(casId);
    await firestore.setUser({
      id : orcid, 
      orcid : record,
      ucd : ucd
    });

    // updates
    let user = await this.getUser(orcid);
    await this._addEmployment(user, updates, token);

    // if we changed something, set user
    if( updates.length > 0 ) {
      record = JSON.parse((await orcidApi.get(orcid, token)).body);
      await firestore.setUser({id: orcid, orcid: record});
    }

    return {updates, record};
  }

  async _addEmployment(user, messages, token) {
    let startDate = new Date(user.ucd.department.assocStartDate);
    let roleTitle = user.ucd.department.titleDisplayName;
    let deptName = user.ucd.department.deptDisplayName;

    let employmentSummary = user.orcid['activities-summary'].employments['employment-summary'];

    let ringgoldIds = [];
    (employmentSummary || []).forEach(e => {
      if( e.organization['disambiguated-organization']['disambiguation-source'] === 'RINGGOLD' ) {
        ringgoldIds.push({
          id : e.organization['disambiguated-organization']['disambiguated-organization-identifier'],
          source : (e.source['source-name'] || {}).value
        });
      }
    });

    let ucdCode = '';
    for( let key in config.ringgold.ucd ) {
      if( config.ringgold.ucd[key].ucdDeptCode === '' ) {
        ucdCode = key;
        break;
      }
    }

    let ucdRinggold = ringgoldIds.find(e => {
      return (
        e.id === ucdCode &&
        e.source === config.ringgold.sourceName
      )
    });

    // check if they have ucd ringgold
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

  async getUcdInfo(casId) {
    let iamId = await ucdApi.getIamId(casId);

    let name = await ucdApi.getNameInfo(iamId);
    let contact = await ucdApi.getContactInfo(iamId);
    let department = await ucdApi.getDepartmentInfo(iamId);
    let departmentOdr = await ucdApi.getDepartmentInfoOdr(iamId);

    return {name, iamId, casId, contact, department, departmentOdr};
  }

  async updateOrcidInfo(orcid, userToken) {
    let info = orcidApi.getResultObject(
      await orcidApi.get(orcid, userToken)
    );

    return firestore.setUser({
      id: orcid,
      orcid: info
    });
  }

}

module.exports = new Users();