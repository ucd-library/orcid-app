import {PolymerElement, html} from "@polymer/polymer"
import template from "./orcid-app.html"

// import models
import "../lib/models"

// add route element, though not used at the moment
import "@ucd-lib/cork-app-state/elements/app-route"

// import styles
import "./styles/style-properties"
import "./styles/shared-styles"

// import npm elemenets
import "@polymer/iron-pages"

// import views
import "./views/login/app-login"
import "./views/login/denied-orcid-oauth"
import "./views/checklist/app-checklist"
import "./views/employment/app-employment"
import "./views/help/app-help"

const NO_HEADER_LIST = ['denied-orcid-oauth',  'employment']

export default class OrcidApp extends Mixin(PolymerElement)
  .with(EventInterface) {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      // allowed page routes, currently just /
      appRoutes : {
        type : Array,
        value : () => APP_CONFIG.appRoutes
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
      orcidUrl : {
        type : String,
        value : APP_CONFIG.orcidUrl
      },
      hideLogout : {
        type : Boolean,
        value : true
      },
      linked : {
        type : Boolean,
        value : false
      },
      page : {
        type : String,
        value : ''
      },
      noHeader : {
        type : Boolean,
        value : false
      },
      isDev : {
        type : Boolean,
        value : (APP_CONFIG.env === 'dev') ? true : false
      }
    }
  }

  constructor() {
    super();

    // check for logged in user but app offline, if so, log user out
    if( APP_CONFIG.user.data && this._isOffline() ) {
      window.location = '/auth/logout';
    }

    let loadingEle = document.querySelector('#loading');
    if( loadingEle ) loadingEle.remove();

    this._injectModel('AppStateModel');
  }

  ready() {
    super.ready();

    if( APP_CONFIG.user.data && this._isOffline() ) {
      return;
    }

    this.AppStateModel.setLocationElement(this.$.appRoute);

    this.hideLogout = (Object.keys(APP_CONFIG.user.session || {}).length === 0);

    let page = this.AppStateModel.store.data.location.path[0];

    if( this._userLoggedInAndLinked() ) {  
      if( !page || page === 'login' ) {
        this.AppStateModel.setLocation('/scorecard');
      }
    } else if( page !== 'help' && page !== 'denied-orcid-oauth' ) {
      this.AppStateModel.setLocation('/login');
    }

    // double check?
    let loadingEle = document.querySelector('#loading');
    if( loadingEle ) loadingEle.remove();
  }

  _isOffline() {
    return (APP_CONFIG.appStatus && APP_CONFIG.appStatus.online === false);
  }

  _onAppStateUpdate(e) {
    if( window.gtag ) {
      gtag('config', APP_CONFIG.analyticsKey, {
        page_path: window.location.pathname
      });
    }

    let page = e.location.path[0];
    
    if( !page ) {
      if( !this._userLoggedInAndLinked() ) page = 'login';
      else page = 'scorecard';
    }
    
    this.page = page;
    
    this.noHeader = (NO_HEADER_LIST.indexOf(page) > -1);
  }

  _userLoggedInAndLinked() {
    return (APP_CONFIG.user.data && APP_CONFIG.user.data.linked) ? true : false;
  }

}



customElements.define('orcid-app', OrcidApp);