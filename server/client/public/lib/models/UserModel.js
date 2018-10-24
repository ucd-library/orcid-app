const {BaseModel} = require('@ucd-lib/cork-app-utils');
const UserService = require('../services/UserService');
const UserStore = require('../stores/UserStore');

class UserModel extends BaseModel {

  constructor() {
    super();

    this.store = UserStore;
    this.service = UserService;
      
    this.register('UserModel');
  }

  /**
   * @method get
   * @description load an ORCiD record
   * 
   */
  async get(sync=false) {
    let record = this.store.getUserRecord();

    try {
      if( record && record.request ) {
        await record.request;
      } else {
        await this.service.get(sync);
      }
    } catch(e) {}

    let state = this.store.getUserRecord();
    this._checkRejectedTokenState(state);

    return state;
  }

  async updateEmployments(employments) {
    try {
      await this.service.updateEmployments(employments);
    } catch(e) {}
    this.store.getEmploymentsUpdate();
  }

  /**
   * @method _checkRejectedTokenState
   * @description if we made an ORCiD API call and the API responded that the ORCiD token
   * is invalid, this means the user has removed permission of this application.  The server
   * will have already unlinked the user at this point, so the application just needs to redirect
   * them to the home screen
   * 
   * @param {Object} state 
   */
  _checkRejectedTokenState(data) {
    if( data.state !== 'error' ) return;
    let e = data.error.payload;

    if( e.body && e.body.error === 'invalid_token' ) {
      window.location = '/';
    }
  }

  // async updateEmployment(putCode, id, data) {
  //   let state = this.store.getRecordSaveState(putCode);

  //   if( state && state.request ) {
  //     try {
  //       await record.request;
  //     } catch(e) {}
  //   }

  //   try {
  //     await this.service.updateEmployment(putCode, id, data);
  //   } catch(e) {}

  //   return this.store.getRecordSaveState(putCode);
  // }

  // async deleteEmployment(putCode, id) {
  //   let state = this.store.getRecordSaveState(putCode);
    
  //   try {
  //     return await this.service.deleteEmployment(putCode, id);
  //   } catch(e) {
  //     return e;
  //   }
  // }

  // async addEmployment(id, data) {
  //   let state = this.store.getRecordSaveState(id);

  //   if( state && state.request ) {
  //     try {
  //       await record.request;
  //     } catch(e) {}
  //   }

  //   try {
  //     await this.service.addEmployment(id, data);
  //   } catch(e) {}

  //   return this.store.getRecordSaveState(id);
  // }

}

module.exports = new UserModel();