const {BaseModel} = require('@ucd-lib/cork-app-utils');
const UserStore = require('../stores/UserStore');
const config = require('../config');

class EmploymentModel extends BaseModel {

  constructor() {
    super();
    this.register('EmploymentModel');
  }

  hasUcdSourceEmployments() {
    let user = UserStore.getUserRecord().payload;
    if( !user.ucd || !user.orcid ) {
      return false;
    }

    let employments = user.orcid['activities-summary'].employments['employment-summary'];
    for( let e of employments ) {
      if( this._isAppSource(e.source) ) {
        return true;
      }
    }

    return false;
  }

  getUcdEmployments() {
    let data = {
      positions : [],
      organizations : []
    }

    let user = UserStore.getUserRecord().payload;
    if( !user.ucd || !user.orcid ) {
      return data;
    }

    let employments = user.orcid['activities-summary'].employments['employment-summary'];

    if( user.ucd.departmentOdr ) {
      let pos = {
        odr : true,
        org : config.orgs.ucd,
        title : user.ucd.departmentOdr.titleDisplayName,
        department : user.ucd.departmentOdr.deptDisplayName,
        startDate : this._getDisplayStartDate(
          this._getEarliestStartDate(user.ucd.departmentPps)
        )
      }
      this._setEnable(pos, employments);
      data.positions.push(pos);
    }

    for( let pps of user.ucd.departmentPps ) {
      let pos = {
        org : config.orgs.ucd,
        title : pps.appTitle,
        department : pps.division.deptOfficialName,
        startDate : this._getDisplayStartDate(pps.createDate)
      }
      this._setEnable(pos, employments);
      data.positions.push(pos);

      if( config.appPartners[pos.department] ) {
        let p = config.appPartners[pos.department];
        pos = {
          org : config.orgs[p.org],
          department : p.label,
          startDate : this._getDisplayStartDate(pps.createDate)
        };
        this._setEnable(pos, employments);
        data.organizations.push(pos);
      }
    }

    for( let app of user.ucd.departmentApp ) {
      let p = config.appPartners[app.displayName];
      let pos = {
        org : config.orgs[p.org],
        department : app.displayName,
        startDate : this._getDisplayStartDate(app.startDate)
      };
      this._setEnable(pos, employments);
      data.organizations.push(pos);
    }

    return data;
  }

  _setEnable(pos, employments) {
    pos.enabled = false;

    for( let e of employments ) {
      if( 
        e['department-name'] === (pos.department || null) &&
        e['role-title'] === (pos.title || null) &&
        this._getDateFromOrcid(e['start-date']) === pos.startDate &&
        this._isAppSource(e.source)
      ) {
        pos.enabled = true;
        return;
      }
    }
  }

  _isAppSource(source) {
    if( source && 
        source['source-client-id'] && 
        source['source-client-id'].path === APP_CONFIG.clientId ) {
      return true;
    }
    return false;
  }

  _getDateFromOrcid(date) {
    return date.year.value+'-'+date.month.value+'-'+date.day.value;
  }

  _getEarliestStartDate(pps=[]) {
    let earliest = new Date(pps[0].createDate).getTime();
    for( var i = 1; i < pps.length; i++ ) {
      let t = new Date(pps[i].createDate).getTime();
      if( earliest > t ) earliest = t;
    }

    return new Date(earliest);
  }

  _getDisplayStartDate(date) {
    if( !date ) return '';
    if( typeof date !== 'object' ) {
      date = new Date(date);
    }
    return date.toISOString().replace(/T.*/, '');
  }

}

module.exports = new EmploymentModel();