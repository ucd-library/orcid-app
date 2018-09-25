const firestore = require('../../lib/firestore');

module.exports = (firestore, collection) => {

  async function clean() {
    let result = await firestore
      .db.collection(collection)
      .where('expires', '<', new Date())
      .get()

    for( var i = 0; i < result.docs.length; i++ ) {
      try {
        await firestore
          .db.collection(collection)
          .doc(result.docs[i].id)
          .delete();
      } catch(e) {
        console.error('Failed to clean session:', result.docs[i].id);
      }
    }
  }

  setInterval(clean, 1000 * 60 * 60 * 6);
  setTimeout(clean, 2000);

}