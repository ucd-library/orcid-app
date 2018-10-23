import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-checklist-employments.html"


export default class AppChecklistEmployments extends Mixin(PolymerElement)
  .with(EventInterface) {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      record : {
        type : Object,
        value : ({})
      },
      hasEmployment : {
        type : Boolean,
        value : false
      }
    }
  }

  constructor() {
    super();
    this._injectModel('UserModel');
    this._injectModel('ValidatorModel');
  }

  ready() {
    super.ready();
    
    if( APP_CONFIG.user.data && APP_CONFIG.user.data.linked ) {
      this._render(APP_CONFIG.user.data.orcid);
    }
  }

  _render(record) {
    this.record = record;

    let recordEmployments = this.ValidatorModel.getAppEmployments(record);
  }

  /**
   * @method _onUserRecordUpdate
   * @description bound to user-record-update event from ORCiD model. If loaded re-render
   * the element
   * 
   * @param {Object} e model event
   */
  _onUserRecordUpdate(e) {
    if( e.state !== 'loaded' ) return;
    this._render(e.payload);
    this.style.opacity = 1;
  }

}

customElements.define('app-checklist-employments', AppChecklistEmployments);