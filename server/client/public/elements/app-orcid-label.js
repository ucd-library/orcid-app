import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-orcid-label.html"

export default class AppOrcidLabel extends PolymerElement {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      orcid : {
        type : String,
        value : ''
      },
      orcidUrl : {
        type : String,
        computed : '_computeOrcidUrl(orcid)'
      }
    }
  }

  _computeOrcidUrl(orcid) {
    return APP_CONFIG.orcidUrl+'/'+orcid;
  }

}

customElements.define('app-orcid-label', AppOrcidLabel);