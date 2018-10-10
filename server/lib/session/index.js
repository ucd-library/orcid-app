/**
 * Based on NPM module which had some race condition bugs: 
 * https://www.npmjs.com/package/firestore-store
 * 
 * This is a Express Session implementation for Google Firestore.  This implementation
 * caches sessions in memory until save is complete in Firestore.  Additionally, sessions
 * are cached in memory for up to 5 seconds after access to speed up performance.
 */
const firestore = require('../../lib/firestore');
const config = require('../../config');
const session = require('express-session');
const FirestoreStore = require('./store');
const CustomSessionParser = require('./parser');

require('./clean')(firestore, config.firestore.collections.sessions);

module.exports = session({
  store: new FirestoreStore({
    database: firestore.db,
    collection : config.firestore.collections.sessions,
    parser: new CustomSessionParser
  }),
  name              : 'ucd-orcid-app',
  secret            : config.server.cookieSecret,
  resave            : false,
  saveUninitialized : true,
  cookie : {
    maxAge          : config.server.cookieMaxAge,
  }
});