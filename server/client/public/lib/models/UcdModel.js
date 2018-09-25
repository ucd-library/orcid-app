const {BaseModel} = require('@ucd-lib/cork-app-utils');
const UcdService = require('../services/UcdService');
const UcdStore = require('../stores/UcdStore');

class UcdModel extends BaseModel {

  constructor() {
    super();

    this.store = UcdStore;
    this.service = UcdService;
      
    this.register('UcdModel');
  }

  async link() {
    await this.service.link();
    return this.store.data.link;
  }

}

module.exports = new UcdModel();