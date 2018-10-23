const {BaseStore} = require('@ucd-lib/cork-app-utils');

class UserStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      record : {},
      employmentsUpdate : {}
    };
    this.events = {
      USER_RECORD_UPDATE : 'user-record-update',
      USER_EMPLOYMENTS_UPDATE_UPDATE : 'user-employments-update-update'
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

  setUpdateEmploymentsLoading(request, employments) {
    this.data.employmentsUpdate = {
      state : this.STATE.LOADING, 
      payload : employments,
      request
    }
    this._updateEmploymentsUpdate();
  }

  setUpdateEmploymentsLoaded(payload) {
    this.data.employmentsUpdate = {
      state : this.STATE.LOADED,
      payload
    }
    this._updateEmploymentsUpdate();
  }

  setUpdateEmploymentsError(error) {
    this.data.employmentsUpdate = {
      state : this.STATE.ERROR,
      error
    }
    this._updateEmploymentsUpdate();
  }

  _updateEmploymentsUpdate() {
    this.emit(this.events.USER_EMPLOYMENTS_UPDATE_UPDATE, this.data.employmentsUpdate);
  }

  getEmploymentsUpdate() {
    return this.data.employmentsUpdate;
  }

}

module.exports = new UserStore();