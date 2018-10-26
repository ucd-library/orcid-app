const {Storage} = require('@google-cloud/storage');
const config = require('../config');

class CloudStorage {

  constructor() {
    // running in google env
    if( config.GOOGLE_ENV ) {
      this.storage = new Storage();
    // running elsewhere
    } else {  
      this.storage = new Storage({
        projectId : config.google.key.project_id,
        credentials : config.google.key
      });
    }
  }

  async ensureBucket(bucket) {
    bucket = this.storage.bucket(bucket);
    let exists = (await bucket.exists())[0];
    if( !exists ) {
      await bucket.create();
    }
  }

  async fileExists(bucket, bucketPath) {
    return (await this.storage.bucket(bucket).file(bucketPath).exists())[0];
  }

  downloadFile(bucket, bucketPath, localPath) {
    return this.storage
      .bucket(bucket)
      .file(bucketPath)
      .download({destination: localPath});
  }

  async addFile(bucket, filePath, bucketPath) {
    return this.storage.bucket(bucket).upload(filePath, {
      destination: bucketPath
    });
  }

  async getFiles(bucket) {
    await this.ensureBucket(bucket);
    return (await this.storage.bucket(bucket).getFiles())[0];
  }

}

module.exports = new CloudStorage();