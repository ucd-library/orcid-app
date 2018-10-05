const {BaseStore} = require('@ucd-lib/cork-app-utils');

class UcdStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      link : {},
      autoUpdate : {}
    };

    this.events = {
      USER_UCD_LINK_UPDATE : 'user-ucd-link-update',
      UCD_AUTO_UPDATE_UPDATE : 'ucd-auto-update-update'
    };
  }

  setLinkLoading(request) {
    this._setLink({
      state : this.STATE.LOADING,
      request
    });
  }

  setLinkLoaded(payload) {
    this._setLink({
      state : this.STATE.LOADED,
      payload
    });
  }

  setLinkError(error) {
    this._setLink({
      state : this.STATE.ERROR,
      error
    });
  }

  _setLink(state) {
    this.data.link = state;
    this.emit(this.events.USER_UCD_LINK_UPDATE, state);
  }

  setAutoUpdateLoading(request) {
    this._setAutoUpdate({
      state : this.STATE.LOADING,
      request
    });
  }

  setAutoUpdateLoaded(payload) {
    this._setAutoUpdate({
      state : this.STATE.LOADED,
      payload
    });
  }

  setAutoUpdateError(error) {
    this._setAutoUpdate({
      state : this.STATE.ERROR,
      error
    });
  }

  _setAutoUpdate(state) {
    this.data.autoUpdate = state;
    this.emit(this.events.UCD_AUTO_UPDATE_UPDATE, state);
  }

}

module.exports = new UcdStore();