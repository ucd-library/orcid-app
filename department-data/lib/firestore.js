const admin = require('firebase-admin');
const config = require('../../server/config');

admin.initializeApp({
  credential: admin.credential.cert(config.google.key)
});

/**
 * @class Firestore
 * @description static class wrapper for access to firestore
 */
class Firestore {

  constructor() {
    this.db = admin.firestore();
    this.db.settings({timestampsInSnapshots: true});
    this.collection = config.firestore.collections.userDepartments;
    this.config = config.firestore;
  }

  clearAll() {
    var collectionRef = this.db.collection(this.collection);
    var query = collectionRef.limit(100);
  
    return new Promise((resolve, reject) => {
      deleteQueryBatch(this.db, query, resolve, reject);
    });
  }

  insert(data) {
    this.db
      .collection(this.collection)
      .doc()
      .set(data);
  }
}

async function deleteQueryBatch(db, query, resolve, reject) {
  let snapshot = await query.get();
  if (snapshot.size == 0) {
    resolve();
    return;
  }

  // Delete documents in a batch
  var batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  
  if (snapshot.size === 0) {
    resolve();
    return;
  }
        
  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteQueryBatch(db, query, batchSize, resolve, reject);
  });
}

module.exports = new Firestore();