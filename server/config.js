const secrets = require('./secrets');
const env = process.env.NODE_ENV || 'dev';


let baseApiUrl = 'pub';
if( process.env.ORCID_API === 'member' ) {
  baseApiUrl = 'api';
}
if( process.env.NODE_ENV !== 'prod' ) {
  baseApiUrl += '.sandbox'
}

const PORT = 8000;
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

  env,

  server : {
    host : process.env.SERVER_HOST || `http://localhost:${PORT}`,
    port : PORT, 
    assets : (env === 'prod') ? 'dist' : 'public',
    loglevel : process.env.SERVER_LOG_LEVEL || 'info',
    cookieSecret : process.env.SERVER_COOKIE_SECRET || 'changeme',
    cookieMaxAge : process.env.SERVER_COOKIE_MAX_AGE ? parseInt(process.env.SERVER_COOKIE_MAX_AGE) : (1000 * 60 * 60 * 24 * 7),
    appRoutes : ['main', 'app']
  },

  client : {
    versions : {
      bundle : clientPackage.version,
      loader : clientPackage.dependencies['@ucd-lib/cork-app-load'].replace(/^\D/, '')
    }
  },

  orcid : {
    clientId : secrets.orcid[env].clientId,
    clientSecret : secrets.orcid[env].clientSecret,
    accessToken : secrets.orcid[env].accessToken,
    sessionName : 'orcid-session',
    api : {
      baseUrl : `https://${baseApiUrl}.orcid.org/v2.1`
    }
  },

  cas : Object.assign(CAS[env], {
    sessionName : 'cas-session'
  }),

  google : {}

}