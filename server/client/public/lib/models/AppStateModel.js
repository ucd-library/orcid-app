const {AppStateModel} = require('@ucd-lib/cork-app-state');
const AppStateStore = require('../stores/AppStateStore');

class AppStateModelImpl extends AppStateModel {

  constructor() {
    super();

    this.store = AppStateStore;

    if( APP_CONFIG.user.orcid ) {
      this.select(APP_CONFIG.user.orcid.orcid);
    }
  }

  select(id) {
    this.store.select(id);
  }

}

module.exports = new AppStateModelImpl();