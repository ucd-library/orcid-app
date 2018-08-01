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

  async get(id) {
    let record = this.store.getUserRecord(id);

    if( record && record.request ) {
      await record.request;
    } else {
      await this.service.get(id);
    }

    return this.store.getUserRecord(id);
  }

}

module.exports = new OrcidModel();