import {PolymerElement, html} from "@polymer/polymer"
import template from "./app-edit-record.html"

export default class AppEditRecord extends Mixin(PolymerElement)
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

  async _loadRecord(force=false) {
    this.OrcidModel.get(this.selectedId, force);
  }

  async _save() {
    let role = this.$.role.value;
    let dept = this.$.department.value;
    if( !role && !dept ) return;

    let e = this.employments[0];
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
      return alert(resp.error.message);
    }

    this._loadRecord(true);
    this.$.role.value =  '';
    this.$.department.value = '';
  }

  async _add() {
    let d = {
      "department-name":"Librarz",
      "role-title":"Application Developez",
      "start-date":{"day":{"value":"12"},"month":{"value":"02"},"year":{"value":"2018"}},
      "end-date":null,
      "organization":{
        "name":"University of California Davis",
        "address":{"city":"Davis","region":"CA","country":"US"},
        "disambiguated-organization":{
          "disambiguated-organization-identifier":"8789",
          "disambiguation-source":"RINGGOLD"
        }
      }
    };

    let resp = await this.OrcidModel.addEmployment('0000-0003-3951-6779', d);
    // let resp = await this.OrcidModel.addEmployment(this.selectedId, d);
    if( resp.error ) {
      return alert('Error');
    } else {
      alert('success')
    }

    this._loadRecord(true);
  }

  async _delete(e) {
    let index = parseInt(e.currentTarget.getAttribute('index'));
    let putCode = this.employments[index]['put-code'];

    let resp = await this.OrcidModel.deleteEmployment(putCode);
    if( resp.error ) {
      return alert(resp.error.message);
    }

    this._loadRecord(true);
  }

  _onUserRecordUpdate(e) {
    if( e.state !== 'loaded' ) return;

    this.record = e;
    this.active = true;
    this.employments = this.record.data['activities-summary'].employments['employment-summary'];
    this.employments.forEach(e => {
      e.sourceName = e.source['source-name'].value;
    })
    console.log(this.employments);
  }

}

customElements.define('app-edit-record', AppEditRecord);