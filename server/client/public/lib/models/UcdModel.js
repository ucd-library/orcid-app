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

  /**
   * @method link
   * @description link the users ORCiD and UCD records
   * 
   * @returns {Promise} resolves to link request state
   */
  async link() {
    await this.service.link();
    return this.store.data.link;
  }

  /**
   * @method autoUpdate
   * @description Update users ORCiD record with verified UCD information
   * 
   * @returns {Promise} resolves to autoUpdate state
   */
  async autoUpdate() {
    await this.service.autoUpdate();
    return this.store.data.autoUpdate;
  }

}

module.exports = new UcdModel();