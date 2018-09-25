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