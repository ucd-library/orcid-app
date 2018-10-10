import {PolymerElement, html} from "@polymer/polymer"
import "@polymer/iron-icon"

import template from "./app-checklist-mark.html"

export default class AppChecklistMark extends PolymerElement {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      text : {
        type : String,
        value : ''
      },
      error : {
        type : Boolean,
        value : false
      },
      checked : {
        type : Boolean,
        value : false
      }
    }
  }

}

customElements.define('app-checklist-mark', AppChecklistMark);