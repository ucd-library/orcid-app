const firestore = require('./firestore');
const ucdApi = require('./ucd-iam-api');
const orcidApi = require('./orcid-api');

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

  async getUcdInfo(casId) {
    let iamId = await ucdApi.getIamId(casId);

    let name = await ucdApi.getNameInfo(iamId);
    let contact = await ucdApi.getContactInfo(iamId);
    let department = await ucdApi.getDepartmentInfo(iamId);

    return {name, iamId, contact, department};
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