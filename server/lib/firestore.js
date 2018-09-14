const admin = require('firebase-admin');
const config = require('../config');

// running in google env
if( config.GOOGLE_ENV ) {
  
  admin.initializeApp({
    credential: admin.credential.applicationDefault()
  });

// running elsewhere
} else {
  
  admin.initializeApp({
    credential: admin.credential.cert(config.google.key)
  });

}

class Firestore {

  constructor() {
    this.db = admin.firestore();
    this.db.settings({timestampsInSnapshots: true});
    this.config = config.firestore;
  }

  /**
   * @method setUser
   * @description write user data to firestore
   * 
   * @param {Object} user
   * @param {String} user.id required. orcid
   * @param {Object} user.ucd
   * @param {Object} user.orcid
   * @param {Object} user.session
   * 
   * @returns {Promise} 
   */
  setUser(user, options={}) {
    // default to merge in data
    if( options.merge === undefined ) {
      options.merge = true;
    }

    return this.db
      .collection(this.config.collections.users)
      .doc(user.id)
      .set(user, options);
  }

  /**
   * @method getUser
   * @description get username by orcid
   * 
   * @param {String} id users orcid
   * 
   * @returns {Promise} resolves to user object of null
   */
  async getUser(id) {
    let result = await this.db
      .collection(this.config.collections.users)
      .doc(id)
      .get();

    if( !result.exists ) return null;
    return result.data();
  }

}

module.exports = new Firestore();