import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-login-cas.html"

export default class AppLoginCas extends PolymerElement {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      loggedIn : {
        type : Boolean,
        value : APP_CONFIG.user.session.cas ? true : false
      },
      username : {
        type : String,
        value : APP_CONFIG.user.session.cas
      }
    }
  }

}

customElements.define('app-login-cas', AppLoginCas);