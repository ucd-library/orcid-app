const {BaseService} = require('@ucd-lib/cork-app-utils');
const OrcidStore = require('../stores/OrcidStore');

class OrcidService extends BaseService {

  constructor() {
    super();
    this.store = OrcidStore;

    if( typeof APP_CONFIG !== 'undefined' ) {
      if( APP_CONFIG.user.orcid ) {
        this.access_token = APP_CONFIG.user.orcid.access_token;
      }
      this.baseUrl = APP_CONFIG.baseApiUrl
    }
  }

  get() {
    return this.request({
      url : `/api/orcid/`,
      onLoading : request => this.store.setUserRecordLoading(request),
      onLoad : result => this.store.setUserRecordLoaded(result.body.result),
      onError : e => this.store.setUserRecordError(e)
    });
  }

  // updateEmployment(putCode, id, data) {
  //   return this.request({
  //     url : `/api/orcid/${id}/employment/${putCode}`,
  //     fetchOptions : {
  //       method : 'PUT',
  //       mode : 'cors',
  //       credentials : 'include',
  //       headers : {
  //         authentication : `Bearer ${this.access_token}`,
  //        'content-type' : 'application/json'
  //       },
  //       body : JSON.stringify(data) 
  //     },
  //     onLoading : request => this.store.setUserRecordSaving(putCode, id, data, request),
  //     onLoad : result => this.store.setUserRecordSaved(putCode, id, result.body),
  //     onError : e => this.store.setUserRecordSaveError(putCode, id, e)
  //   });
  // }

  // deleteEmployment(putCode, id) {
  //   return this.request({
  //     url : `/api/orcid/${id}/employment/${putCode}`,
  //     fetchOptions : {
  //       method : 'DELETE'
  //     }
  //   });
  // }

  // addEmployment(id, data) {
  //   return this.request({
  //     url : `/api/orcid/${id}/employment`,
  //     fetchOptions : {
  //       method : 'POST',
  //       headers : {
  //        'content-type' : 'application/json'
  //       },
  //       body : JSON.stringify(data) 
  //     },
  //     onLoading : request => this.store.setUserRecordSaving(id, id, data, request),
  //     onLoad : result => this.store.setUserRecordSaved(id, id, result.body),
  //     onError : e => this.store.setUserRecordSaveError(id, id, e)
  //   });
  // }

}

module.exports = new OrcidService();