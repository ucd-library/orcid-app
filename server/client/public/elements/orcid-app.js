import {PolymerElement, html} from "@polymer/polymer"
import template from "./orcid-app.html"

import "../lib/models"

// import "@polymer/iron-pages"
import "@ucd-lib/cork-app-state/elements/app-route"

import "./styles/style-properties"
import "./styles/shared-styles"

import "./pages/app-home"
import "./login/app-login"
import "./login/app-login-cas"
import "./login/app-login-orcid"
import "./record/app-view-record"
import "./record/app-edit-record"
import "./checklist/app-checklist"
import "./app-auto-edit"

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
      },
      loggedIn : {
        type : Boolean,
        value : (APP_CONFIG.user.cas && APP_CONFIG.user.orcid) ? true : false
      },
      username : {
        type : String,
        value : ''
      },
      orcid : {
        type : String,
        value : ''
      },
      hideLogout : {
        type : Boolean,
        value : true
      },
      linked : {
        type : Boolean,
        value : false
      }
    }
  }

  constructor() {
    super();

    if( APP_CONFIG.user.session.orcid ) {
      this.username = APP_CONFIG.user.session.orcid.name;
      this.orcid = APP_CONFIG.user.session.orcid.orcid;
    }

    this.hideLogout = (Object.keys(APP_CONFIG.user.session || {}).length === 0);

    if( APP_CONFIG.user.data ) {
      this.linked = APP_CONFIG.user.data.linked;
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