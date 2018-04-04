const {expect} = require('chai');

const S3ToAnything  = require('../src/s3-to-anything');
const silentLogger  = require('./helpers/silentLogger');

const allowedPrefix = 'objects';

/**
 * @return {S3ToAnything} S3 to anything
 */
const getService = () => new S3ToAnything(silentLogger);

const validEvent = {
  Records: [{
    eventSource: 'aws:s3',
    s3:          {
      bucket: {name: 'bucket.name'},
      object: {key: allowedPrefix + '/object.key'}
    }
  }]
};

describe('S3ToAnything.constructor', () => {
  it('should work', () => {
    const service = getService();
    expect(service).to.be.an.instanceOf(S3ToAnything);
    expect(service).to.have.own.property('logger');
    expect(service).to.have.own.property('observers');
  });
});

describe('S3ToAnything.process', () => {
  it('should fail if S3Client has not been set', () => {
    const service = getService();
    expect(() => service.process()).to.throw();
  });
  it('should not fail if S3Client has  been set', () => {
    expect(() => getService().process(validEvent)).to.not.throw();
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

    let wasCalled = false;

    new S3ToAnything(silentLogger)
      .addObserver(() => {
        wasCalled = true;
      },
      data => allowedPrefix === data.filePrefix
      )
      .process(event);

    expect(wasCalled).to.be.equal(false);

  });
  it('should not fail if file prefix is known', () => {
    const event = {
      Records: [{
        eventSource: 'aws:s3',
        s3:          {
          bucket: {name: 'bucket.name'},
          object: {key: allowedPrefix + '/object.key'}
        }
      }]
    };

    let wasCalled = false;

    new S3ToAnything(silentLogger)
      .addObserver(() => {
        wasCalled = true;
      },
      data => allowedPrefix === data.filePrefix
      )
      .process(event);

    expect(wasCalled).to.be.equal(true);

  });
  it('should handle callback errors', () => {
    const service = getService();
    service.addObserver(() => {
      throw new Error('this is an error');
    });
    expect(() => service.process(validEvent)).to.throw();
  });
});

describe('S3ToAnything.addObserver', () => {
  it('should execute observer callbacks', () => {
    let observerCalled = false;
    getService()
      .addObserver(() => {
        observerCalled = true;
      })
      .process(validEvent);
    expect(observerCalled).to.equal(true);
  });
});
