const {BaseService} = require('@ucd-lib/cork-app-utils');
const UcdStore = require('../stores/UcdStore');

class UcdService extends BaseService {

  constructor() {
    super();
    this.store = UcdStore;
  }

  link() {
    return this.request({
      url : `/api/ucd/link`,
      onLoading : request => this.store.setLinkLoading(request),
      onLoad : result => this.store.setLinkLoaded(result.body),
      onError : e => this.store.setLinkError(e)
    });
  }

  autoUpdate() {
    return this.request({
      url : `/api/ucd/auto-update`,
      onLoading : request => this.store.setAutoUpdateLoading(request),
      onLoad : result => this.store.setAutoUpdateLoaded(result.body),
      onError : e => this.store.setAutoUpdateError(e)
    });
  }

}

module.exports = new UcdService();