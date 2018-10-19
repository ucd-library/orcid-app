import {PolymerElement, html} from "@polymer/polymer"
import template from "./denied-orcid-oauth.html"

export default class DeniedOrcidOauth extends PolymerElement {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      
    }
  }

}

customElements.define('denied-orcid-oauth', DeniedOrcidOauth);