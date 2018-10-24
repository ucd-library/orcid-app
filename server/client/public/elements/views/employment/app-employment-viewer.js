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
    let data = this.EmploymentModel.getOrcidEmployments();
    
    this.positions = data.positions.map(p => {
      p = Object.assign({}, p);
      p.hasDepartment = p.department ? true : false;
      return p;
    });
    this.organizations = data.organizations;
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