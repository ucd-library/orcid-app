import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-view-record.html"

export default class AppViewRecord extends Mixin(PolymerElement)
  .with(EventInterface) {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      selectedId : {
        type : String,
        value : ''
      },
      employments : {
        type : Array,
        value : () => []
      },
      active : {
        type : Boolean,
        value : false,
        reflectToAttribute : true
      }
    }
  }

  constructor() {
    super();
    this._injectModel('AppStateModel');
    this._injectModel('OrcidModel');

    if( this.AppStateModel.store.selectedRecord ) {
      this.selectedId = this.AppStateModel.store.selectedRecord;
      this._loadRecord();
    }
  }

  _onSelectedRecordUpdate(id) {
    this.selectedId = id;
    this._loadRecord();
  }

  async _loadRecord() {
    this.record = await this.OrcidModel.get(this.selectedId);
    this.active = true;
    this.employments = this.record.data['activities-summary'].employments['employment-summary'];
    console.log(this.employments);
  }

}

customElements.define('app-view-record', AppViewRecord);