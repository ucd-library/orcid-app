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
  }

  ready() {
    super.ready();
    if( !APP_CONFIG.user.session.orcid ) return;


    if( APP_CONFIG.user.session.linked ) {
      console.log('Set app state');
      // this.AppStateModel.set();
    } else if( APP_CONFIG.user.session.orcid.orcid ) {
      let orcid = APP_CONFIG.user.session.orcid;
      this.orcid = orcid.orcid;
      this.orcidName = orcid.name;
      this.orcidUrl = 'https://sandbox.orcid.org/'+this.orcid;
      this.section = 'cas-login'
    }
  }

}

customElements.define('app-login', AppLogin);