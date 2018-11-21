process.env.API_ENV = 'prod';
let config = require('../config');
config.google.key = require('../service-account-prod');
const firestore = require('../lib/firestore');

let accessed = 0;
let linked = 0;
let wroteEmployment = 0;

(async function() {
  await firestore.getAll('users',
    async (id, data) => {
      isCoE(data.ucd, data.orcid, data.linked);
    }
  )
  console.log('accessed', accessed);
  console.log('linked', linked);
  console.log('wroteEmployment', wroteEmployment);
})();

function isCoE(user={}, orcid, linkedAccount) {
  let pps = user.departmentPps || [];
  for( let e of pps ) {
    if(e.division.orgOId === 'F80B657C9EFC23A0E0340003BA8A560D' ) {
      accessed++;
      console.log(user.name.oFullName);
    
      if( linkedAccount ) {
        linked++; 
        if( hasAppUcdEmployment(orcid) ) wroteEmployment++;
      }

      return;
    }
  }
}

function hasEmployment(record) {
  if( !record['activities-summary'] ) return false;
  if( !record['activities-summary'].employments ) return false;
  if( !record['activities-summary'].employments['employment-summary'] ) return false;
  if( record['activities-summary'].employments['employment-summary'].length > 0 ) {
    return record['activities-summary'].employments['employment-summary'];
  }
  return false;
}

function hasAppUcdEmployment(record) {
  let employments = hasEmployment(record);
  if( !employments ) return false;
  for( let e of employments ) {
    if( !e.source ) continue;
    if( !e.source['source-client-id'] ) continue;
    if( e.source['source-client-id']['path'] === config.orcid.sourceId ) {
      return true;
    }
  }

  return false;
}