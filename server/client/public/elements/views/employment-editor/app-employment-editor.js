import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-employment-editor.html"

import "./app-checkbox"

export default class AppEmploymentEditor extends Mixin(PolymerElement)
  .with(EventInterface) {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      userData : {
        type : Object,
        value : () => ({}),
        observer : '_userDataObserver'
      },
      positions : {
        type : Object,
        value : () => []
      },
      organizations : {
        type : Object,
        value : () => []
      },
      hasOrgs : {
        type : Boolean,
        value : false
      }
    }
  }

  constructor() {
    super();
    this._injectModel('UserModel');
    this._injectModel('EmploymentModel');
  }

  ready() {
    super.ready();

    let data = this.UserModel.store.data.record;
    if( data.linked ) this.userData = data;
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
    this.userData = e.payload;
  } 

  /**
   * @method _userDataObserver
   * @description bound to userData property changes
   */
  _userDataObserver() {
    if( !this.userData ) return;
    if( !this.userData.ucd ) return;

    // debugger;
    let data = this.EmploymentModel.getUcdEmployments();
    
    this.positions = data.positions;
    this.organizations = data.organizations;
    this.hasOrgs = data.organizations.length > 0 ? true : false;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this._setDefaults();
      });
    })
  }

  _setDefaults() {
    if( this.EmploymentModel.hasUcdSourceEmployments() ) {
      return;
    }
    
    let hasOdr = false;
    for( let pos of this.positions ) {
      if( pos.odr ) hasOdr = true;
    }

    if( hasOdr ) {
      this.set('positions.0.enabled', true);
    } else {
      for( let i = 0; i < this.positions.length; i++ ) {
        this.set(`positions.${i}.enabled`, true);
      }
    }

    for( let i = 0; i < this.organizations.length; i++ ) {
      this.set(`organizations.${i}.enabled`, true);
    }
  }

  _save() {

    let employments = this.positions
      .filter(e => e.enabled)
      .concat(this.organizations.filter(e => e.enabled))
      .map(e => {
        e = Object.assign({}, e);
        e.code = e.org;
        delete e.enabled;
        delete e.org;
        delete e.odr;
        return e;
      })
    
    // set default ucd record
    if( employments.length === 0 ) {
      let user = this.UserModel.store.getUserRecord().payload;
      employments.push({
        code : APP_CONFIG.orgs.ucd,
        startDate : this.EmploymentModel._getDisplayStartDate(
          this.EmploymentModel._getEarliestStartDate(user.ucd.departmentPps)
        )
      });
    }

    // console.log(employments);
    this.UserModel.updateEmployments(employments);
  }


}

customElements.define('app-employment-editor', AppEmploymentEditor);