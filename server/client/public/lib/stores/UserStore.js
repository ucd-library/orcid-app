const {BaseStore} = require('@ucd-lib/cork-app-utils');

class UserStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      record : {}
    };
    this.events = {
      USER_RECORD_UPDATE : 'user-record-update'
    };

    if( typeof window !== 'undefined' && 
        window.APP_CONFIG &&
        APP_CONFIG.user &&
        APP_CONFIG.user.data ) {
      this.setUserRecordLoaded(APP_CONFIG.user.data);
    }
  }

  setUserRecordLoading(request) {
    this.data.record = {
      state : this.STATE.LOADING, 
      request
    }
    this._userRecordUpdate();
  }

  setUserRecordLoaded(payload) {
    this.data.record = {
      state : this.STATE.LOADED,
      payload
    }
    this._userRecordUpdate();
  }

  setUserRecordError(error) {
    this.data.record = {
      state : this.STATE.ERROR,
      error
    }
    this._userRecordUpdate();
  }

  _userRecordUpdate() {
    this.emit(this.events.USER_RECORD_UPDATE, this.data.record);
  }

  getUserRecord() {
    return this.data.record;
  }

}

module.exports = new UserStore();