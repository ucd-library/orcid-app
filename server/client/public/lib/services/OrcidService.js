const {BaseService} = require('@ucd-lib/cork-app-utils');
const OrcidStore = require('../stores/OrcidStore');

class OrcidService extends BaseService {

  constructor() {
    super();
    this.store = OrcidStore;
  }

  get(id) {
    return this.request({
      url : `api/orcid/${id}`,
      checkCached : () => this.store.data.records[id],
      onLoading : request => this.store.setUserRecordLoading(id, request),
      onLoad : result => this.store.setUserRecordLoaded(id, result.body.record),
      onError : e => this.store.setUserRecordError(id, e)
    });
  }


}

module.exports = new OrcidService();