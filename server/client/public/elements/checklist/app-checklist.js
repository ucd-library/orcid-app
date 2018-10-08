import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-checklist.html"

import "@polymer/iron-icons/iron-icons"
import "./app-checklist-help"
import "./app-checklist-mark"
import "./app-completed-chart"

import validator from "../../lib/models/ValidatorModel"

export default class AppChecklist extends Mixin(PolymerElement)
  .with(EventInterface) {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      checklist : {
        type: Array,
        value : () => []
      },
      errors : {
        type : Array,
        value : () => []
      }
    }
  }

  constructor() {
    super();
    this._injectModel('AppStateModel');
    this._injectModel('UcdModel');
    this._injectModel('OrcidModel');
  }

  ready() {
    super.ready();
    
    if( APP_CONFIG.user.data && APP_CONFIG.user.data.linked ) {
      this._render(APP_CONFIG.user.data.orcid);
    }
  }

  _render(record) {
    this.record = record;
    let results = validator.analyze(this.record);

    this.$.chart.percent = results.total;
    this.checklist = results.checklist;
    this.errors = results.errors;
  }

  async _onReloadClicked() {
    if( APP_CONFIG.user.session.orcid && APP_CONFIG.user.session.orcid.orcid ) {
      this.style.opacity = 0.5;
      this.OrcidModel.get(APP_CONFIG.user.session.orcid.orcid, true); 
    }
  }

  _onUserRecordUpdate(e) {
    if( e.state !== 'loaded' ) return;
    this._render(e.payload);
    this.style.opacity = 1;
  }

}

customElements.define('app-checklist', AppChecklist);