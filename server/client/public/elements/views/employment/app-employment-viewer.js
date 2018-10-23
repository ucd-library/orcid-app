import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-employment-viewer.html"

export default class AppEmploymentViewer extends Mixin(PolymerElement)
  .with(EventInterface) {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      
    }
  }

  constructor() {
    super();
    this._injectModel('UserModel');
    this._injectModel('EmploymentModel');
  }

  ready() {
    super.ready();
    
    if( APP_CONFIG.user.data && APP_CONFIG.user.data.linked ) {
      this._render();
    }
  }

  _render() {
    let data = this.EmploymentModel.getUcdEmployments();
    
    let positions = data.positions.filter(p => p.enabled);
    if( positions.length === 0 ) {
      let user = this.UserModel.store.getUserRecord().payload;
      let employments = user.orcid['activities-summary'].employments['employment-summary'];
      for( let e of employments ) {
        if( this.EmploymentModel.isAppSource(e.source) ) {
          positions = [{
            startDate : this.EmploymentModel._getDateFromOrcid(e['start-date']),
            title : '',
            department : 'Not Specified'
          }];
          break;
        }
      } 
    }
    this.positions = positions;
    
    this.organizations = data.organizations.filter(o => o.enabled);

    
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


}

customElements.define('app-employment-viewer', AppEmploymentViewer);