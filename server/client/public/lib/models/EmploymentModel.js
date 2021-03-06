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
      if( this.isAppSource(e.source) ) {
        return true;
      }
    }

    return false;
  }

  getOrcidEmployments() {
    let data = {
      positions : [],
      organizations : []
    }

    let user = UserStore.getUserRecord().payload;
    if( !user.ucd || !user.orcid ) {
      return data;
    }

    let employments = user.orcid['activities-summary'].employments['employment-summary'];
    for( let e of employments ) {
      if( !this.isAppSource(e.source) ) continue;

      let pos = {
        org : e.organization['disambiguated-organization']['disambiguated-organization-identifier'],
        title : e['role-title'],
        department : e['department-name'],
        startDate : e['start-date'].year.value+'-'+
                    e['start-date'].month.value+'-'+
                    e['start-date'].day.value
      }

      if( pos.org === APP_CONFIG.orgs.ucd ) {
        data.positions.push(pos);
      } else {
        data.organizations.push(pos);
      }
    }

    return data;
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
      let odrArr = user.ucd.departmentOdr;
      if( !Array.isArray(odrArr) ) {
        odrArr = [odrArr];
      }

      odrArr.forEach(odr => {
        let pos = {
          odr : true,
          org : config.orgs.ucd,
          title : odr.titleDisplayName,
          department : odr.deptDisplayName,
          startDate : this._getDisplayStartDate(
            this.getOdrDate(user.ucd.departmentPps, odr)
          )
        }
        this._setEnable(pos, employments);
        data.positions.push(pos);
      });
    }

    for( let pps of user.ucd.departmentPps ) {
      let pos = {
        org : config.orgs.ucd,
        title : pps.appTitle,
        department : pps.division.deptOfficialName,
        startDate : this._getDisplayStartDate(this._getPpsDate(pps))
      }
      this._setEnable(pos, employments);
      data.positions.push(pos);

      if( config.appPartners[pos.department] ) {
        let p = config.appPartners[pos.department];
        pos = {
          org : config.orgs[p.org],
          department : p.label,
          startDate : this._getDisplayStartDate(this._getPpsDate(pps))
        };
        this._setEnable(pos, employments);

        if( !data.organizations.find(o => o.org === pos.org) ) {
          data.organizations.push(pos);
        }
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

      if( !data.organizations.find(o => o.org === pos.org) ) {
        data.organizations.push(pos);
      }
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
        this.isAppSource(e.source)
      ) {
        pos.enabled = true;
        return;
      }
    }
  }

  isAppSource(source) {
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

  _getPpsDate(obj) {
    return this._cleanDate(obj.assocStartDate);
  }

  _getOdrDate(obj) {
    return this._cleanDate(obj.startDate || obj.modifyDate);
  }

  /**
   * @method _cleanDate
   * @description strip off time information from date.  UCD IAM apis return with space
   * between date and time :/
   * 
   * @param {String} date
   * 
   * @return {String}
   */
  _cleanDate(date='') {
    return date.replace(/[ T].*/, '');
  }

  /**
   * @method getOdrDate
   * @description get the odr start date given all PPS records and
   * the odr record
   * 
   * @param {Array} pps array of pps records
   * @param {Object} odr odr record
   * 
   * @return {Date}
   */
  getOdrDate(pps=[], odr) {
    // if odr has start date, return it
    // this almost never happens
    if( odr.startDate ) {
      return new Date(this._cleanDate(odr.startDate))
    }

    // get the latest Pps date
    let latestPps = this._getLatestPpsDate(pps);

    // if there is no modify date on odr, return latest pps
    if( !odr.modifyDate ) {
      return latestPps;
    }

    let modifyDate = new Date(this._cleanDate(odr.modifyDate));

    // return the earliest date between odr modified and latest pps
    if( modifyDate.getTime() < latestPps.getTime() ) {
      return modifyDate;
    }
    return latestPps;
  }

  _getLatestPpsDate(pps=[]) {
    let latest = new Date(this._getPpsDate(pps[0])).getTime();
    for( var i = 1; i < pps.length; i++ ) {
      let t = new Date(this._getPpsDate(pps[i])).getTime();
      if( latest < t ) latest = t;
    }
    return new Date(latest);
  }

  getEarliestStartDate(pps=[], odr) {
    if( !odr ) odr = [];
    if( Array.isArray(odr) ) odr = [odr]; 

    let earliest = new Date(this._getPpsDate(pps[0])).getTime();
    for( var i = 1; i < pps.length; i++ ) {
      let t = new Date(this._getPpsDate(pps[i])).getTime();
      if( earliest > t ) earliest = t;
    }

    for( var i = 1; i < odr.length; i++ ) {
      let t = new Date(this._getOdrDate(odr[i])).getTime();
      if( earliest > t ) earliest = t;
    }

    return new Date(earliest);
  }

  _getDisplayStartDate(date) {
    if( !date ) return '';    
    if( typeof date !== 'object' ) {
      date = new Date(date.replace(/[ T].*/, ''));
    }
    return date.toISOString().replace(/T.*/, '');
  }

}

module.exports = new EmploymentModel();