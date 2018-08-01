const {BaseStore} = require('@ucd-lib/cork-app-utils');

class OrcidStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      records : {}
    };
    this.events = {
      USER_RECORD_UPDATE : 'user-record-update'
    };
  }

  setUserRecordLoading(id, request) {
    this.data.records[id] = {
      state : this.STATE.LOADING, 
      request
    }
    this._userRecordUpdate();
  }

  setUserRecordLoaded(id, data) {
    this.data.records[id] = {
      state : this.STATE.LOADED,
      data
    }
    this._userRecordUpdate();
  }

  setUserRecordError(id, error) {
    this.data.records[id] = {
      state : this.STATE.ERROR,
      error
    }
    this._userRecordUpdate();
  }

  _userRecordUpdate(id) {
    this.emit(this.events.USER_RECORD_UPDATE, this.data.records[id]);
  }

  getUserRecord(id) {
    return this.data.records[id];
  }
  
}

module.exports = new OrcidStore();