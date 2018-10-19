import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-checklist.html"

import "@polymer/iron-icons/iron-icons"
import "./app-checklist-help"
import "./app-checklist-mark"
import "./app-completed-chart"
import "./app-checklist-employments"
import "../../app-orcid-label"

import validator from "../../../lib/models/ValidatorModel"

export default class AppChecklist extends Mixin(PolymerElement)
  .with(EventInterface) {

  static get template() {
    return html([template]);
  }

  static get properties() {
    return {
      record : {
        type : Object,
        value : () => ({})
      },
      checklist : {
        type: Array,
        value : () => []
      },
      errors : {
        type : Array,
        value : () => []
      },
      orcidUrl : {
        type : String,
        value : ''
      }
    }
  }

  constructor() {
    super();

    this.orcidUrl = APP_CONFIG.orcidUrl;

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

  /**
   * @method _render
   * @description render a users ORCiD record in checklist
   * 
   * @param {Object} record ORCiD record
   */
  _render(record) {
    this.record = record;

    let name = record.person.name
    this.username = name['given-names'].value + ' ' + name['family-name'].value;
    this.orcid = record['orcid-identifier'].path;

    let results = validator.analyze(this.record);

    this.$.chart.percent = results.total;
    
    results.checklist.forEach(item => {
      if( item.id === 'employment' ) item.isEmployment = true;
    });
    this.checklist = results.checklist;
    this.errors = results.errors;
  }

  /**
   * @method _onReloadClicked
   * @description bound to click event on reload anchor tag.  Reload the user record.
   */
  async _onReloadClicked() {
    // if( APP_CONFIG.user.session.orcid && APP_CONFIG.user.session.orcid.orcid ) {
      this.style.opacity = 0.5;
      this.OrcidModel.get(); 
    // }
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

  _rejectToken() {
    if( !confirm('Are you sure you want to disconnect UC Davis from your ORCiD record?') ) {
      return;
    }
    window.location = '/api/orcid/reject-token';
  }

}

customElements.define('app-checklist', AppChecklist);