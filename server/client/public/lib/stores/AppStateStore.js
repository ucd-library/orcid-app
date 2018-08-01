const {AppStateStore} = require('@ucd-lib/cork-app-state');

class ImplAppStateStore extends AppStateStore {

  constructor() {
    super();

    this.data.selectedRecord = '';
    this.events.SELECTED_RECORD_UPDATE = 'selected-record-update';
  }

  select(id) {
    this.data.selectedRecord = id;
    this.emit(this.events.SELECTED_RECORD_UPDATE, id);
  }

}

module.exports = new ImplAppStateStore();