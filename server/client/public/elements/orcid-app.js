import {PolymerElement, html} from "@polymer/polymer"
import template from "./orcid-app.html"

import "../lib/models"

import "@polymer/iron-pages"
import "@ucd-lib/cork-app-state/elements/app-route"

import "./pages/app-home"
import "./login/app-login-cas"
import "./login/app-login-orcid"
import "./record/app-view-record"

import AppStateInterface from "./interfaces/AppStateInterface"

export default class OrcidApp extends Mixin(PolymerElement)
  .with(EventInterface, AppStateInterface) {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      appRoutes : {
        type : Array,
        value : () => APP_CONFIG.appRoutes
      },
      page : {
        type : String,
        value : 'home'
      }
    }
  }

  /**
   * @method _onAppStateUpdate
   * @description AppStateInterface
   */
  _onAppStateUpdate(e) {
    let page = e.location.path ? e.location.path[0] : 'home';
    if( !page ) page = 'home'

    if( page === this.page ) return;
    
    window.scrollTo(0, 0);
    this.page = page;
  }

}



customElements.define('orcid-app', OrcidApp);