const {BaseModel} = require('@ucd-lib/cork-app-utils');
const OrcidService = require('../services/OrcidService');
const OrcidStore = require('../stores/OrcidStore');
const UcdStore = require('../stores/UcdStore');

class OrcidModel extends BaseModel {

  constructor() {
    super();

    this.store = OrcidStore;
    this.service = OrcidService;
      
    this.register('OrcidModel');

    // When the the UCD Model auto-updates a record and changes were made,
    // update the record in the ORCiD store
    this.EventBus.on(UcdStore.events.UCD_AUTO_UPDATE_UPDATE, (e) => {
      if( e.state !== UcdStore.STATE.LOADED ) return;
      if( (e.payload.updates || []).length === 0 ) return;
      this.store.setUserRecordLoaded(e.payload.record);
    });
  }

  /**
   * @method get
   * @description load an ORCiD record
   * 
   */
  async get() {
    let record = this.store.getUserRecord();

    try {
      if( record && record.request ) {
        await record.request;
      } else {
        await this.service.get();
      }
    } catch(e) {}

    let state = this.store.getUserRecord();
    this._checkRejectedTokenState(state);

    return state;
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

module.exports = new OrcidModel();