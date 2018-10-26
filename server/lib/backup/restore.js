const firestore = require('../firestore');
const cloudStorage = require('../cloud-storage');
const config = require('../../config');
const fs = require('fs-extra');
const path = require('path');
const readline = require('readline');
const logger = require('../../lib/logger');

class Restore {

  constructor() {
    this.BATCH_SIZE = 20;
  }

  async run(date) {
    if( typeof date === 'object' ) {
      date = date.toISOString().replace(/T.*/, '');
    }

    let bucket = config.cloudStorage.backup.bucketName;
    let backupFilename = 'backup-'+date+'.jsonl';

    let exists = await cloudStorage.fileExists(bucket, backupFilename);
    if( !exists ) throw new Error(`No backup file exists for ${date} in bucket ${bucket}`);
    logger.info(`Restoring from bucket ${bucket} file ${backupFilename}, downloading file...`);
    
    let localFile = path.join('/tmp', backupFilename);

    try {
      await cloudStorage.downloadFile(bucket, backupFilename, localFile);

      logger.info('Clearing collections');
      await this.clearAllCollections();

      logger.info('Restoring documents from backup file');
      let results = await this.insertBackup(localFile);
      if( results.lines !== results.inserts ) {
        throw new Error(`Lines read from backup file (${results.lines}) does not back document writes ${results.lines}`);
      }
    } catch(e) {
      logger.fatal('Failed to restore firestore', e);
    }

    if( fs.existsSync(localFile) ) {
      await fs.unlink(localFile);
    }
  }

  insertBackup(localFile) {
    // verify counts
    let lines = 0;
    let inserts = 0;

    return new Promise((resolve, reject) => {
      let batchArray = [];
      const rl = readline.createInterface({
        input: fs.createReadStream(localFile),
      });

      rl.on('line', async line => {
          rl.pause();
          lines++;
          inserts += await this.addDocument(JSON.parse(line), batchArray);
          rl.resume();
        })
        .on('close', async () => {
          if( batchArray.length > 0 ) {
            inserts += (await this._setBatch(batchArray)).length;
          }
          resolve({lines, inserts});
        })
        .on('error', e => reject(e));
    });
  }

  async addDocument(backupRecord, batchArray) {
    batchArray.push({
      ref : backupRecord.collection+'/'+backupRecord.id,
      data : backupRecord.data
    });

    if( batchArray.length >= this.BATCH_SIZE ) {
      let query = await this._setBatch(batchArray);
      backupRecord.splice(0, backupRecord.length);
      return query.length;
    }

    return 0;
  }

  /**
   * @method clearAllCollections
   * @description clean out backup collections of all docs
   * 
   * @returns {Promise}
   */
  async clearAllCollections() {
    let collections = config.cloudStorage.backup.collections;
    for( let collection of collections ) {
      await this.clearCollection(collection);
    }
  }

  /**
   * @method clearCollection
   * @description clean out backup collection of all docs
   * 
   * @param {String} collection
   * 
   * @returns {Promise}
   */
  async clearCollection(collection) {
    let batchArray = [];
    
    await firestore.getAll(
      collection,
      async (id, data, doc) => {
        batchArray.push(doc);
        if( batchArray.length >= this.BATCH_SIZE ) {
          await this._removeBatch(batchArray);
          batchArray = []; 
        }
      },
      this.BATCH_SIZE
    );

    if( batchArray.length > 0 ) {
      await this._removeBatch(batchArray);
    }
  }

  /**
   * @method _removeBatch
   * @description remove an array of docs as a batch
   * 
   * @param {Array} docs 
   * 
   * @return {Promise} 
   */
  _removeBatch(docs) {
    var batch = firestore.db.batch();
    docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    return batch.commit();
  }

  /**
   * @method _removeBatch
   * @description set an array of docs as a batch
   * 
   * @param {Array} docs 
   * 
   * @return {Promise} 
   */
  _setBatch(docs) {
    var batch = firestore.db.batch();
    docs.forEach((doc) => {
      batch.set(firestore.db.doc(doc.ref), doc.data);
    });
    return batch.commit();
  }

}

let restore = new Restore();

if( process.argv.length > 2 ) {
  restore.run(process.argv[2]);
}

module.exports = restore;