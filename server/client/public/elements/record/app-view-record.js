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

  _loadRecord(force=false) {
    this.OrcidModel.get(this.selectedId,force);
  }

  _onUserRecordUpdate(e) {
    if( e.state !== 'loaded' ) return;

    this.record = e;
    this.active = true;
    this.employments = this.record.data['activities-summary'].employments['employment-summary'];
  }

  async _save(e) {
    let index = parseInt(e.currentTarget.getAttribute('index'));
   
    let role = this.shadowRoot.querySelector(`.role[index="${index}"]`).value;
    let dept = this.shadowRoot.querySelector(`.dept[index="${index}"]`).value;
    if( !role && !dept ) return;

    e = this.employments[index];
    let putCode = e['put-code'];
    let data = {
      'put-code' : putCode,
      'start-date' : e['start-date'],
      'end-date' : e['end-date'],
      organization : e.organization
    }
    
    if( role ) {
      data['role-title'] = role;
    }
    if( dept ) {
      data['department-name'] = dept;
    }

    let resp = await this.OrcidModel.updateEmployment(putCode, this.selectedId, data);
    if( resp.error ) {
      return alert('error');
    } else {
      alert('success')
    }

    this._loadRecord(true);
  }

  async _delete(e) {
    let index = parseInt(e.currentTarget.getAttribute('index'));
    let putCode = this.employments[index]['put-code'];

    let resp = await this.OrcidModel.deleteEmployment(putCode, this.selectedId);
    if( resp.error ) {
      return alert('error');
    }

    this._loadRecord(true);
  }


}

customElements.define('app-view-record', AppViewRecord);