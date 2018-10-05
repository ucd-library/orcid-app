import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-auto-edit.html"

export default class AppAutoEdit extends PolymerElement {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      
    }
  }

  ready() {
    
  }

}

customElements.define('app-auto-edit', AppAutoEdit);