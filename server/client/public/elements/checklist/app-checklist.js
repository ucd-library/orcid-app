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
    this._injectModel('OrcidModel');
  }

  _onSelectedRecordUpdate(id) {
    this.selectedId = id;
    this.OrcidModel.get(this.selectedId, true);
  }

  _onUserRecordUpdate(e) {
    if( e.state !== 'loaded' ) return;

    this.record = e.data;
    let results = validator.analyze(this.record);

    this.$.chart.percent = results.total;
    this.checklist = results.checklist;
    this.errors = results.errors;
  }

  async _onReloadClicked() {
    this.style.opacity = 0.5;
    await this.OrcidModel.get(this.selectedId, true);
    this.style.opacity = 1;
  }

}

customElements.define('app-checklist', AppChecklist);