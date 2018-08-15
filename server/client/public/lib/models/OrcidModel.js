const {BaseModel} = require('@ucd-lib/cork-app-utils');
const OrcidService = require('../services/OrcidService');
const OrcidStore = require('../stores/OrcidStore');

class OrcidModel extends BaseModel {

  constructor() {
    super();

    this.store = OrcidStore;
    this.service = OrcidService;
      
    this.register('OrcidModel');
  }

  async get(id, force=false) {
    let record = this.store.getUserRecord(id);

    try {
      if( record && record.request ) {
        await record.request;
      } else if( !force && record && record.state === 'loaded' ) {
        return record;
      } else {
        await this.service.get(id);
      }
    } catch(e) {}
    

    return this.store.getUserRecord(id);
  }

  async updateEmployment(putCode, id, data) {
    let state = this.store.getRecordSaveState(putCode);

    if( state && state.request ) {
      try {
        await record.request;
      } catch(e) {}
    }

    try {
      await this.service.updateEmployment(putCode, id, data);
    } catch(e) {}

    return this.store.getRecordSaveState(putCode);
  }

  async deleteEmployment(putCode, id) {
    let state = this.store.getRecordSaveState(putCode);
    
    try {
      return await this.service.deleteEmployment(putCode, id);
    } catch(e) {
      return e;
    }
  }

  async addEmployment(id, data) {
    let state = this.store.getRecordSaveState(id);

    if( state && state.request ) {
      try {
        await record.request;
      } catch(e) {}
    }

    try {
      await this.service.addEmployment(id, data);
    } catch(e) {}

    return this.store.getRecordSaveState(id);
  }

}

module.exports = new OrcidModel();