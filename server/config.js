const secrets = require('./secrets');
const path = require('path');
const fs = require('fs');

const apiEnv = process.env.API_ENV || 'dev';

// let baseApiUrl = 'pub';
let baseApiUrl = 'api';
if( process.env.ORCID_API === 'member' ) {
  baseApiUrl = 'api';
}
if( apiEnv !== 'prod' ) {
  baseApiUrl += '.sandbox'
}

const PORT = process.env.PORT || 8000;
let assetsDir = (process.env.CLIENT_ENV === 'prod') ? 'dist' : 'public';
let clientPackage = require(`./client/${assetsDir}/package.json`);

const CAS = {
  dev : {
    url : process.env.CAS_URL || 'https://ssodev.ucdavis.edu/cas'
  },
  prod : {
    url : process.env.CAS_URL || 'https://cas.ucdavis.edu/cas'
  }
}

const GOOGLE_ENV = process.env.GOOGLE_CLOUD_PROJECT ? true : false;
if( !GOOGLE_ENV ) {
  let keyPath = path.join(__dirname, 'service-account.json');
  if( fs.existsSync(keyPath) ) {
    secrets.google = require(keyPath);
  }
}

module.exports = {
  GOOGLE_ENV,
  apiEnv,
  env : apiEnv,

  server : {
    host : process.env.SERVER_HOST || `http://localhost:${PORT}`,
    port : PORT, 
    loglevel : process.env.SERVER_LOG_LEVEL || 'info',
    cookieSecret : process.env.SERVER_COOKIE_SECRET || 'changeme',
    cookieMaxAge : process.env.SERVER_COOKIE_MAX_AGE ? parseInt(process.env.SERVER_COOKIE_MAX_AGE) : (1000 * 60 * 60 * 24 * 7),
    appRoutes : ['login', 'scorecard', 'help', 'denied-orcid-oauth', 'employment'],
    sessionName : 'app-session'
  },

  client : {
    env :  process.env.CLIENT_ENV || 'dev',
    assets : assetsDir,
    versions : {
      bundle : clientPackage.version,
      loader : clientPackage.dependencies['@ucd-lib/cork-app-load'].replace(/^\D/, '')
    }
  },

  orcid : {
    clientId : secrets.orcid[apiEnv].clientId,
    clientSecret : secrets.orcid[apiEnv].clientSecret,
    accessToken : secrets.orcid[apiEnv].accessToken,
    sessionName : 'orcid-session',
    url : apiEnv === 'prod' ? 'https://orcid.org' : 'https://sandbox.orcid.org',
    api : {
      baseUrl : `https://${baseApiUrl}.orcid.org/v2.1`,
      scopes : '/read-limited /activities/update'
    },
    oauthBaseUrl : (apiEnv === 'prod') ? 'https://orcid.org/oauth' : 'https://sandbox.orcid.org/oauth',
    sourceId : secrets.orcid[apiEnv].clientId
  },

  firestore : {
    collections : {
      users : 'users',
      sessions : 'sessions',
      admins : 'admins',
      // app defined department lists
      userDepartments : 'user-departments'
    }
  },

  ucd : {
    api : {
      baseUrl : 'https://iet-ws.ucdavis.edu/api/iam',
      key : secrets.ucd.key,
      version : '1.0'
    },
    cas : Object.assign(CAS[apiEnv], {
      sessionName : 'cas-session'
    }),
  },

  google : {
    key : secrets.google
  },

  ringgold : {
    orgs : {
      ucd : '8789',
      coe : '140245',
      eei : '522604'
    },
    appPartners : {
      'COLLEGE OF ENGINEERING' : {
        label : 'College of Engineering',
        org : 'coe'
      },
      'Energy and Efficiency Institute' : {
        label : 'Energy and Efficiency Institute',
        org : 'eei'
      }
    },

    ucd : {
      org: 'ucd',
      code : '8789',
      label : 'University of California Davis'
    }
  }

}