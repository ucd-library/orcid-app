import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-help.html"

import "@polymer/iron-pages"

import "./app-crossref-help"
import "./app-faq"

export default class AppHelp extends Mixin(PolymerElement)
  .with(EventInterface) {


  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      selectedView : {
        type : String,
        value : ''
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
      }
    }
  }

}

customElements.define('app-help', AppHelp);