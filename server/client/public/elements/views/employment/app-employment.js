import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-employment.html"

import "@polymer/iron-pages"

import "./employment-editor/app-employment-editor"
import "./app-employment-viewer"

export default class AppEmployment extends Mixin(PolymerElement)
  .with(EventInterface) {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      selectedView : {
        type : String,
        value : 'view'
      },
      page : {
        type : String,
        value : ''
      }
    }
  }

  constructor() {
    super();
    this._injectModel('AppStateModel');
  }

  _onAppStateUpdate(e) {
    if( e.location.path[0] === this.page ) {
      if( e.location.path.length > 1 ) {
        this.selectedView = e.location.path[1]
      } else {
        this.selectedView = 'view'
      }
    }
  }

}

customElements.define('app-employment', AppEmployment);