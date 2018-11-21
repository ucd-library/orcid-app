const firestore = require('./firestore');
const config = require('../config');

class AdminUtils {

  async getUserOverview() {
    let users = [];
    await firestore.getAll(
      config.firestore.collections.users,
      (id, data) => users.push(data)
    );

    let rows = [];
    for( let user of users ) {
      let employments = [];
      
      if( user.orcid ) {
        employments = user.orcid['activities-summary'].employments['employment-summary'] || [];
    
        employments = employments.filter(e => {
          return (e.source['source-client-id'] && e.source['source-client-id'].path === config.orcid.clientId);
        });
      }
      

      if( employments.length === 0 ) {
        rows.push(this._getUserOverview(user));
      } else {
        employments.forEach(e => rows.push(this._getUserOverview(user, e)));
      }
    }

    return rows;
  }

  _getUserOverview(record, employment={}) {
    return {
      casId : record.id,
      name : record.ucd ? record.ucd.name.dFullName : '',
      linked : record.linked,
      orcidId : record.orcid ? record.orcid['orcid-identifier'].path : '',
      organization : employment.organization ? employment.organization.name : '',
      department : employment['department-name'] || '',
      role : employment['role-title'] || '',
      visibility : employment.visibility || '',
      startDate : this._getStartDate(employment)
    }
  }

  _getStartDate(employment) {
    if( !employment['start-date'] ) return '';
    let sd = employment['start-date'];
    return sd.year.value+'-'+sd.month.value+'-'+sd.day.value;
  }

}

module.exports = new AdminUtils();