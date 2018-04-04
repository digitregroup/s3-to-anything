const {expect} = require('chai');

const S3ToAnything  = require('../src/s3-to-anything');
const S3ClientDummy = require('./dummies/s3-client');
const silentLogger  = require('./helpers/silentLogger');

const allowedPrefix           = 'objects';
process.env.S3_ALLOWED_PREFIX = allowedPrefix;

/**
 * @return {S3ToAnything} S3 to anything
 */
const getService = () => {
  const event = {
    Records: [{
      eventSource: 'aws:s3',
      s3:          {
        bucket: {name: 'bucket.name'},
        object: {key: allowedPrefix + '/object.key'}
      }
    }]
  };

  return new S3ToAnything(event, silentLogger);
};


const s3Client = new S3ClientDummy({
  accessKeyId:     'accessKeyId',
  secretAccessKey: 'secretAccessKey'
});

describe('S3ToGoToWebinar.constructor', () => {
  it('should work', () => {
    const service = getService();
    expect(service).to.be.an.instanceOf(S3ToAnything);
    expect(service).to.have.own.property('srcBucket', 'bucket.name');
    expect(service).to.have.own.property('srcKey', 'objects/object.key');
    expect(service).to.have.own.property('keyPrefix', 'objects');
  });
});

describe('S3ToGoToWebinar.process', () => {
  it('should fail if S3Client has not been set', () => {
    const service = getService();
    expect(() => service.process()).to.throw();
  });
  it('should not fail if S3Client has  been set', () => {
    expect(() =>
      getService().setS3Client(s3Client)
        .process()
    ).to.not.throw();
  });
  it('should fail if file prefix is unknown', () => {
    const event = {
      Records: [{
        eventSource: 'aws:s3',
        s3:          {
          bucket: {name: 'bucket.name'},
          object: {key: 'unkownprefix/object.key'}
        }
      }]
    };

    const service = new S3ToAnything(event, silentLogger);
    service.setS3Client(s3Client).process(err => expect(err).to.exist);
  });
  it('should handle callback errors', () => {
    const service       = getService();
    const downloadError = service.setS3Client({
      download: (bucket, key, next) => {
        next(new Error('this is an error'));
      }
    });
    const err           = console.error;
    // eslint-disable-next-line no-empty-function
    console.error       = () => {
    };
    downloadError.process(err => expect(err).to.exist);
    console.error = err;
  });
});

describe('S3ToGoToWebinar.addObserver', () => {
  it('should execute observer callbacks', () => {
    let observerCalled = false;
    getService()
      .setS3Client(s3Client)
      .addObserver(() => {
        observerCalled = true;
      })
      .process();
    expect(observerCalled).to.deep.equal(true);
  });
});
