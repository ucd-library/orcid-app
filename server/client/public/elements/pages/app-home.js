import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-home.html"

export default class AppHome extends PolymerElement {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      
    }
  }

}

customElements.define('app-home', AppHome);