import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-login.html"

import "@polymer/iron-pages"

// import "./app-login-cas"
// import "./app-login-orcid"

export default class AppLogin extends Mixin(PolymerElement)
  .with(EventInterface) {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      section : {
        type : String,
        value : 'cas-login'
      }, 
      orcidName : {
        type : String,
        value : ''
      },
      orcidUrl : {
        type : String,
        value : ''
      },
      orcid : {
        type : String,
        value : ''
      },

      // 
      appOnline : {
        type : Boolean,
        value : true
      }
    }
  }

  constructor() {
    super();
    this._injectModel('AppStateModel');
    this._injectModel('EmploymentModel');
    this._injectModel('UcdModel');
  }

  ready() {
    super.ready();

    // check for logged in user but app offline, if so, log user out
    if( APP_CONFIG.appStatus && APP_CONFIG.appStatus.online === false ) {
      this.appOnline = false;
      this.$.appOnlineMsg.innerHTML = APP_CONFIG.appStatus.message || 'The ORCiD Optimizer is currently down for maintenance.';
      return;
    }

    let session = APP_CONFIG.user.session;
    if( !session.cas ) return;

    let userData = APP_CONFIG.user.data || {};

    if( userData.linked ) {
      console.log('Account is linked!');
    } else if ( userData.orcidAccessToken && userData.ucd && userData.orcid ) {
      this.section = 'link-approval';

      let positions = this.EmploymentModel.getUcdEmployments().positions;

      let ucd = APP_CONFIG.user.data.ucd;
      this.ucdName = ucd.name.dFullName;
      this.ucdTitle = positions[0].title;
      this.ucdDept = positions[0].department;
      this.ucdEmail = ucd.contact.email;

      this._setOrcidInfo();

    } else if( userData.ucd ) {
      this.section = 'orcid-login'
    }
  }

  _setOrcidInfo() {
    let orcid = APP_CONFIG.user.data.orcid;
    this.orcid = orcid['orcid-identifier'].path;
    this.orcidName = orcid.person.name['given-names'].value+' '+orcid.person.name['family-name'].value;
    this.orcidUrl = orcid['orcid-identifier'].uri;
  }

  async _linkAccounts() {
    this.linking = true;
    let result = await this.UcdModel.link();
    this.linking = false;

    if( result.state === 'loaded' && result.payload.linked ) {
      // TODO: make this betters.....
      window.location = '/scorecard'
    } else if( result.state === 'error' ) {
      alert('Failed to link accounts: '+result.error.message);
    } else {
      alert('Failed to link accounts');
    }
  }

}

customElements.define('app-login', AppLogin);