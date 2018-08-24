const secrets = require('./secrets');

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
let clientPackage = require('./client/public/package.json');

const CAS = {
  dev : {
    url : process.env.CAS_URL || 'https://ssodev.ucdavis.edu/cas'
  },
  prod : {
    url : process.env.CAS_URL || 'https://cas.ucdavis.edu/cas'
  }
}

module.exports = {

  apiEnv,

  server : {
    host : process.env.SERVER_HOST || `http://localhost:${PORT}`,
    port : PORT, 
    loglevel : process.env.SERVER_LOG_LEVEL || 'info',
    cookieSecret : process.env.SERVER_COOKIE_SECRET || 'changeme',
    cookieMaxAge : process.env.SERVER_COOKIE_MAX_AGE ? parseInt(process.env.SERVER_COOKIE_MAX_AGE) : (1000 * 60 * 60 * 24 * 7),
    appRoutes : ['main', 'app']
  },

  client : {
    env :  process.env.CLIENT_ENV || 'dev',
    assets : (process.env.CLIENT_ENV === 'prod') ? 'dist' : 'public',
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
    api : {
      baseUrl : `https://${baseApiUrl}.orcid.org/v2.1`
    }
  },

  cas : Object.assign(CAS[apiEnv], {
    sessionName : 'cas-session'
  }),

  google : {}

}