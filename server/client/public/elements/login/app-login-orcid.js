import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-login-orcid.html"

export default class AppLoginOrcid extends PolymerElement {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      loggedIn : {
        type : Boolean,
        value : false
      },
      username : {
        type : String,
        value : ''
      },
      orcid : {
        type : String,
        value : ''
      }
    }
  }

  constructor() {
    super();
    if( APP_CONFIG.user.orcid ) {
      this.username = APP_CONFIG.user.orcid.name;
      this.orcid = APP_CONFIG.user.orcid.orcid;
      this.loggedIn = true;
    } else {
      this.loggedIn = false;
    }
  }

}

customElements.define('app-login-orcid', AppLoginOrcid);