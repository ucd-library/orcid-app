const session = require('express-session');
const firestore = require('./firestore');
const config = require('../config');
const FirestoreStore = require('firestore-store')(session);

class CustomSessionParser {
	read(doc) { 
    return JSON.parse( doc.session ) 
  }

	save(doc) { 
    return {
      session: JSON.stringify( doc ),
      expires: doc.cookie ? doc.cookie.expires : null,
		  modified: Date.now()
    }
  }
}

async function clean() {
  let result = await firestore
    .db.collection(config.firestore.collections.sessions)
    .where('expires', '<', new Date())
    .get()

  for( var i = 0; i < result.docs.length; i++ ) {
    try {
      await firestore
        .db.collection(config.firestore.collections.sessions)
        .doc(result.docs[i].id)
        .delete();
    } catch(e) {
      console.error('Failed to clean session:', result.docs[i].id);
    }
  }
}

setInterval(clean, 1000 * 60 * 60 * 6);
setTimeout(clean, 2000);

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