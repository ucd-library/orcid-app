const {AppStateStore} = require('@ucd-lib/cork-app-state');

class ImplAppStateStore extends AppStateStore {

  constructor() {
    super();
  }

}

module.exports = new ImplAppStateStore();