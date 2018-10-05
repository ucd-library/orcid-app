import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-login.html"

import "@polymer/iron-pages"

export default class AppLogin extends Mixin(PolymerElement)
  .with(EventInterface) {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      section : {
        type : String,
        value : 'orcid-login'
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
      }
    }
  }

  constructor() {
    super();
    this._injectModel('AppStateModel');
    this._injectModel('UcdModel');
  }

  ready() {
    super.ready();

    let session = APP_CONFIG.user.session;
    if( !session.orcid ) return;


    if( APP_CONFIG.user.data.linked ) {
      console.log('Account is linked!');
      // this.AppStateModel.set();

    } else if ( session.orcid.orcid && APP_CONFIG.user.unlinkedUcd ) {
      this.section = 'link-approval';

      let ucd = APP_CONFIG.user.unlinkedUcd;
      this.ucdName = ucd.name.dFullName;
      this.ucdTitle = ucd.department.titleOfficialName;
      this.ucdDept = ucd.department.deptOfficialName;
      this.ucdEmail = ucd.contact.email;

      this._setOrcidInfo();

    } else if( session.orcid.orcid ) {
      this._setOrcidInfo();
      this.section = 'cas-login'
    }
  }

  _setOrcidInfo() {
    let orcid = APP_CONFIG.user.session.orcid;
    this.orcid = orcid.orcid;
    this.orcidName = orcid.name;
    this.orcidUrl = APP_CONFIG.orcidUrl + '/' + this.orcid;
  }

  async _linkAccounts() {
    this.linking = true;
    let result = await this.UcdModel.link();
    this.linking = false;

    if( result.state === 'loaded' && result.payload.linked ) {
      // TODO: make this betters.....
      window.location.reload();
    } else if( result.state === 'error' ) {
      alert('Failed to link accounts: '+result.error.message);
    } else {
      alert('Failed to link accounts');
    }
  }

}

customElements.define('app-login', AppLogin);