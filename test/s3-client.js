const {expect} = require('chai');
const mock     = require('mock-require');

mock('aws-sdk/clients/s3', class {
// eslint-disable-next-line class-methods-use-this
  getObject(data, callback) {
    callback(data);
  }
});

const S3Client = require('../src/s3-client');

describe('S3Client.constructor', () => {
  it('should fail if config is not valid', () => {
    expect(() => new S3Client({})).to.throw();
  });
  it('should not fail if config is valid', () => {
    const validConfig = {
      accessKeyId:     'accessKeyId',
      secretAccessKey: 'secretAccessKey',
    };
    expect(() => new S3Client(validConfig)).not.to.throw();
  });
});
describe('S3Client.download', () => {
  it('should download data', () => {
    const validConfig = {
      accessKeyId:     'accessKeyId',
      secretAccessKey: 'secretAccessKey',
    };
    const client      = new S3Client(validConfig);
    const bucket      = 'bkt' + (+new Date);
    const key         = 'pathto/key' + (+new Date);
    client.download(bucket, key, (data) => {
      expect(data).to.have.property('Bucket');
      expect(data.Bucket).to.be.equal(bucket);
      expect(data).to.have.property('Key');
      expect(data.Key).to.be.equal(key);
    });
  });
});
