import {PolymerElement, html} from "@polymer/polymer"
import template from "./orcid-app.html"

// import models
import "../lib/models"

// add route element, though not used at the moment
import "@ucd-lib/cork-app-state/elements/app-route"

// import styles
import "./styles/style-properties"
import "./styles/shared-styles"

// import views
import "./views/login/app-login"
import "./views/checklist/app-checklist"
import "./app-auto-edit"

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

}



customElements.define('orcid-app', OrcidApp);