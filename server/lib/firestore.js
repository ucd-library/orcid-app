const admin = require('firebase-admin');
const config = require('../config');
const FieldValue = admin.firestore.FieldValue;

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

/**
 * @class Firestore
 * @description static class wrapper for access to firestore
 */
class Firestore {

  constructor() {
    this.FieldValue = FieldValue;
    this.db = admin.firestore();
    this.db.settings({timestampsInSnapshots: true});
    this.config = config.firestore;
  }

  /**
   * @method setUser
   * @description write user data to firestore
   * 
   * @param {Object} user
   * @param {String} user.id Required. Must be users ORCiD id
   * @param {Object} user.ucd
   * @param {Object} user.orcid
   * @param
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
   * @method updateUser
   * @description
   * 
   * @param {*} data 
   */
  updateUser(id, data) {
    return this.db
      .collection(this.config.collections.users)
      .doc(id)
      .set(data, {merge: true});
  }

  /**
   * @method getAdmins
   * @description return the list of admins
   * 
   * @return {Promise} resolves to {Array}
   */
  async getAdmins() {
    let admins = [];
    let snapshot = await this.db
      .collection(this.config.collections.admins)
      .get();

    snapshot.forEach(function(doc) {
      admins.push(doc.data().casId);
    });
    return admins;
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

  /**
   * @method get all files for a collection
   * 
   * @param {String} collection collection name
   * @param {Function} onDocLoaded callback, passed id and data.  can return promise
   * @param {Number} size batch size
   * 
   * @returns {Promise}
   */
  getAll(collection, onDocLoaded, size=50) {
    var collectionRef = this.db.collection(collection);
  
    return new Promise((resolve, reject) => {
      getQueryBatch(collectionRef, size, 0, onDocLoaded, resolve, reject);
    });
  }

  /**
   * @method getAppStatus
   * @description return information from the application status collection
   * 
   * @return {Promise} resolves to object
   */
  async getAppStatus() {
    // TODO: should we cache?
    // if( this.appStatusCache === null ) {
    //   return this.appStatusCache;
    // }

    let querySnapshot = await this.db
      .collection(this.config.collections.status)
      .get();
    
    let data;
    if( querySnapshot.docs.length === 0 ) {
      data = {online: true};
    } else {
      data = querySnapshot.docs[0].data();
    }

    // this.appStatusCache = data;
    // setTimeout(() => this.appStatusCache = null, 1000*60*5);

    return data;
  }

}

async function getQueryBatch(collectionRef, size, offset, onDocLoaded, resolve, reject) {
  let snapshot = await collectionRef.limit(size).offset(offset).get();
  if (snapshot.size == 0) {
    return resolve();
  }

  for (let doc of snapshot.docs) {
    await onDocLoaded(doc.id, doc.data(), doc);
  }

  offset += size;
  process.nextTick(() => {
    getQueryBatch(collectionRef, size, offset, onDocLoaded, resolve, reject);
  });
}

module.exports = new Firestore();