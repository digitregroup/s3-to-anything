const S3Client   = require('../../src/s3-client');

const DummyS3Client = class extends S3Client {
  constructor(credentails, doFail) {
    super({
      accessKeyId:     'accessKeyId',
      secretAccessKey: 'secretAccessKey'
    });
    this.doFail = doFail;
  }

  // eslint-disable-next-line class-methods-use-this
  download(ignored, disregarded, next) {
    if (this.doFail) {
      throw new Error('Download failed.');
    }

    return next(null, {Body: JSON.stringify({})});
  }
};

module.exports = DummyS3Client;
