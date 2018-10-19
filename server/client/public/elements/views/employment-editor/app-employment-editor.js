import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-employment-editor.html"

import "./app-checkbox"

export default class AppEmploymentEditor extends PolymerElement {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      
    }
  }

}

customElements.define('app-employment-editor', AppEmploymentEditor);