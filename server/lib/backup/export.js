const config = require('../../config');
const firestore = require('../firestore');
const path = require('path');
const fs = require('fs-extra');
const cloudStorage = require('../cloud-storage');
const logger = require('../logger');

const ROOT = '/tmp';

class Export {


  /**
   * @method run
   * @description run a full backup for today.  This will create or replace any backup
   * file with todays date and cleanup any old backs based on backup rules
   * 
   * @returns {Promise}
   */
  async run() {
    logger.info('starting backup for: '+this._getDate());
    await this.createSnapshot();
    await this.cleanup();
  }

  /**
   * @method createSnapshot
   * @description create the jsonl file snapshot of all collections for today
   * 
   * @returns {Promise}
   */
  async createSnapshot() {
    let bucket = config.cloudStorage.backup.bucketName;
    
    let filename = 'backup-'+this._getDate()+'.jsonl';
    let file = path.join(ROOT, filename);

    if( fs.existsSync(file) ) {
      await fs.unlink(file);
    }

    try {
      await cloudStorage.ensureBucket(bucket);

      let collections = config.cloudStorage.backup.collections;
      for( let collection of collections ) {
        await firestore.getAll(
          collection,
          (id, data) => this._writeJsonlFile(file, {collection, id, data})
        );
      }

      await cloudStorage.addFile(bucket, file, '/'+filename);
    } catch(e) {
      logger.fatal('failed to create backup for '+this._getDate(), e);
    }

    if( fs.existsSync(file) ) {
      await fs.unlink(file);
    }
  }

  /**
   * @method cleanup
   * @description cleanup old backups.  Currently keeping last week and first of the month
   * for a year.
   * 
   * @returns {Promise}
   */
  async cleanup() {
    logger.info('cleaning up backups');

    let now = new Date();
    let lastYear = new Date(now.getFullYear()-1, now.getMonth(), now.getDate()).getTime();
    let lastWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate()-7).getTime();
    let bucket = config.cloudStorage.backup.bucketName;

    let files = await cloudStorage.getFiles(bucket);
    for( let file of files ) {
      let metadata = (await file.getMetadata())[0];
      
      let dateMatch = metadata.name.match(/\d{4}-\d{2}-\d{2}/);
      if( !dateMatch ) {
        logger.warn(`Unknown backup file found in bucket ${bucket}: ${metadata.name}`);
        continue;
      }
      let fileDate = this._createDate(dateMatch[0]);
     
      // less than a week old
      if( fileDate.getTime() > lastWeek ) {
        continue;
      }

      // older than a year
      if( fileDate.getTime() < lastYear ) {
        await file.delete();
        continue;
      }

      // older than a week and less than year old, only keep the first
      if( fileDate.getDate() !== 1 ) {
        await file.delete();
      }
    }

  }

  _createDate(date) {
    date = date.split('-').map(d => parseInt(d));
    return new Date(date[0], date[1]-1, date[2], 12, 0, 0, 0);
  }

  /**
   * @method _getDate
   * @description get current date as string
   * 
   * @return {String}
   */
  _getDate() {
    return new Date().toISOString().replace(/T.*/, '')
  }

  /**
   * @method _writeJsonlFile
   * @description write or append to jsonl file
   * 
   * @param {String} file filename 
   * @param {Object} data json data
   * 
   * @returns {Promise}
   */
  async _writeJsonlFile(file, data) {
    if( !fs.existsSync(file) ) {
      await fs.writeFile(file, JSON.stringify(data));
    } else {
      await fs.appendFile(file, '\n'+JSON.stringify(data));
    }
  }

  // async _createJunk() {
  //   let bucket = config.cloudStorage.backup.bucketName;
  //   await fs.writeFileSync('/tmp/junktest', 'foo bar');

  //   await cloudStorage.addFile(bucket, '/tmp/junktest', 'test-2018-10-26.txt');
  //   await cloudStorage.addFile(bucket, '/tmp/junktest', 'test-2018-10-25.txt');
  //   await cloudStorage.addFile(bucket, '/tmp/junktest', 'test-2018-10-20.txt');
  //   await cloudStorage.addFile(bucket, '/tmp/junktest', 'test-2018-10-19.txt');
  //   await cloudStorage.addFile(bucket, '/tmp/junktest', 'test-2018-10-18.txt');
  //   await cloudStorage.addFile(bucket, '/tmp/junktest', 'test-2018-10-17.txt');
  //   await cloudStorage.addFile(bucket, '/tmp/junktest', 'test-2018-10-05.txt');
  //   await cloudStorage.addFile(bucket, '/tmp/junktest', 'test-2018-10-01.txt');
  //   await cloudStorage.addFile(bucket, '/tmp/junktest', 'test-2018-09-26.txt');
  //   await cloudStorage.addFile(bucket, '/tmp/junktest', 'test-2018-09-01.txt');
  //   await cloudStorage.addFile(bucket, '/tmp/junktest', 'test-2018-08-01.txt');
  //   await cloudStorage.addFile(bucket, '/tmp/junktest', 'test-2018-07-01.txt');
  //   await cloudStorage.addFile(bucket, '/tmp/junktest', 'test-2018-06-01.txt');
  //   await cloudStorage.addFile(bucket, '/tmp/junktest', 'test-2018-05-21.txt');
  //   await cloudStorage.addFile(bucket, '/tmp/junktest', 'test-2018-05-20.txt');
  //   await cloudStorage.addFile(bucket, '/tmp/junktest', 'test-2017-11-01.txt');
  //   await cloudStorage.addFile(bucket, '/tmp/junktest', 'test-2017-11-15.txt');
  //   await cloudStorage.addFile(bucket, '/tmp/junktest', 'test-2017-10-01.txt');
  //   await cloudStorage.addFile(bucket, '/tmp/junktest', 'test-2017-10-15.txt');
  //   await cloudStorage.addFile(bucket, '/tmp/junktest', 'test-2017-09-01.txt');
  //   await cloudStorage.addFile(bucket, '/tmp/junktest', 'test-2017-09-15.txt');
  // }

}

module.exports = new Export();