const {BaseService} = require('@ucd-lib/cork-app-utils');
const UserStore = require('../stores/UserStore');

class UserService extends BaseService {

  constructor() {
    super();
    this.store = UserStore;

    if( typeof APP_CONFIG !== 'undefined' ) {
      if( APP_CONFIG.user.orcid ) {
        this.access_token = APP_CONFIG.user.orcid.access_token;
      }
      this.baseUrl = APP_CONFIG.baseApiUrl
    }
  }

  get() {
    return this.request({
      url : `/api/user`,
      onLoading : request => this.store.setUserRecordLoading(request),
      onLoad : result => this.store.setUserRecordLoaded(result.body),
      onError : e => this.store.setUserRecordError(e)
    });
  }

  updateEmployments(employments) {
    return this.request({
      url : `/api/user/update/employment`,
      fetchOptions : {
        method : 'POST',
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body : JSON.stringify(employments)
      },
      onLoading : request => this.store.setUpdateEmploymentsLoading(request, employments),
      onLoad : result => this.store.setUpdateEmploymentsLoaded(result.body),
      onError : e => this.store.setUpdateEmploymentsError(e)
    });
  }
}

module.exports = new UserService();