import {PolymerElement, html} from "@polymer/polymer"
import template from "./orcid-app.html"

export default class OrcidApp extends PolymerElement {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      
    }
  }

}

customElements.define('orcid-app', OrcidApp);