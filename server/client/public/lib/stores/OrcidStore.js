const {BaseStore} = require('@ucd-lib/cork-app-utils');

class OrcidStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      records : {},
      saving : {}
    };
    this.events = {
      USER_RECORD_UPDATE : 'user-record-update',
      USER_RECORD_SAVING : 'user-record-saving'
    };
  }

  setUserRecordLoading(id, request) {
    this.data.records[id] = {
      state : this.STATE.LOADING, 
      request
    }
    this._userRecordUpdate(id);
  }

  setUserRecordLoaded(id, data) {
    this.data.records[id] = {
      state : this.STATE.LOADED,
      data
    }
    this._userRecordUpdate(id);
  }

  setUserRecordError(id, error) {
    this.data.records[id] = {
      state : this.STATE.ERROR,
      error
    }
    this._userRecordUpdate(id);
  }

  _userRecordUpdate(id) {
    this.emit(this.events.USER_RECORD_UPDATE, this.data.records[id]);
  }

  getUserRecord(id) {
    return this.data.records[id];
  }

  setUserRecordSaving(putCode, id, data, request) {
    this.data.saving[putCode] = {
      state : this.STATE.SAVING,
      data, request, id
    }
  }

  setUserRecordSaved(putCode, id, data) {
    this.data.saving[putCode] = {
      state : this.STATE.LOADED,
      id, data
    }
  }

  setUserRecordSaveError(putCode, id, error) {
    this.data.saving[putCode] = {
      state : this.STATE.SAVE_ERROR,
      error, id
    }
  }

  getRecordSaveState(putCode) {
    return this.data.saving[putCode];
  }

  _onRecordSave(putCode) {
    this.emit(this.events.USER_RECORD_SAVING, this.data.saving[putCode]);
  }


}

module.exports = new OrcidStore();