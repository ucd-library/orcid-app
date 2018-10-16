import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-auto-edit.html"

export default class AppAutoEdit extends Mixin(PolymerElement)
  .with(EventInterface) {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {}
  }

  constructor() {
    super();
    this._injectModel('UcdModel');
  }

  ready() {
    super.ready();
    
    // if the user is logged in and has a linked account, attempt 
    // to auto update account
    if( APP_CONFIG.user.data && APP_CONFIG.user.data.linked ) {
      // this.UcdModel.autoUpdate();
    }
  }

  /**
   * @method _onUcdAutoUpdateUpdate
   * @description bound to UcdModel ucd-auto-update-update event
   * 
   * @param {Object} e event payload 
   */
  _onUcdAutoUpdateUpdate(e) {
    if( e.state !== 'loaded' ) return;

    // if server performed updates, show toast message
    if( e.payload.updates.length > 0 ) {
      this.$.message.innerHTML = e.payload.updates.join('<br />');
      this.style.display = 'block';
      setTimeout(() => this.style.display = 'none', 5000);
    } else {
      console.log('UCD Employement already up to date');
    }
  }

}

customElements.define('app-auto-edit', AppAutoEdit);