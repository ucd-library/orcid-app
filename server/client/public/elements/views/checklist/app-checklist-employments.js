import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-checklist-employments.html"


export default class AppChecklistEmployments extends Mixin(PolymerElement)
  .with(EventInterface) {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      position : {
        type : String,
        value : ''
      },
      department : {
        type : String,
        value : ''
      },
      hasEmployment : {
        type : Boolean,
        value : false
      },
      hasPosition : {
        type : Boolean,
        value : false
      }
    }
  }

  constructor() {
    super();
    this._injectModel('UserModel');
    this._injectModel('AppStateModel');
    this._injectModel('EmploymentModel');
  }

  ready() {
    super.ready();
    
    if( APP_CONFIG.user.data && APP_CONFIG.user.data.linked ) {
      this._render();
    }
  }

  _render() {
    this.hasEmployment = this.EmploymentModel.hasUcdSourceEmployments();

    if( this.hasEmployment ) {
      let pos = this.EmploymentModel
        .getUcdEmployments()
        .positions
        .filter(e => e.enabled);

      if( pos.length > 0 ) pos = pos[0];
      else pos = {};

      this.position = pos.title || '';
      this.hasPosition = this.position ? true : false;
      this.department = pos.department || 'University of California, Davis';
    }
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
    this._render();
  }

  _onEditClicked() {
    this.AppStateModel.setLocation('/employment/view');
  }

}

customElements.define('app-checklist-employments', AppChecklistEmployments);