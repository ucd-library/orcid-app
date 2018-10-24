import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-crossref-help.html"

export default class AppCrossrefHelp extends PolymerElement {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      
    }
  }

}

customElements.define('app-crossref-help', AppCrossrefHelp);