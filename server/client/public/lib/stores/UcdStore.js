const {BaseStore} = require('@ucd-lib/cork-app-utils');

class UcdStore extends BaseStore {

  constructor() {
    super();

    this.data = {
      link : {}
    };

    this.events = {
      USER_UCD_LINK_UPDATE : 'user-ucd-link-update'
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

}

module.exports = new UcdStore();