const {expect} = require('chai');

const S3EventParser = require('../src/s3-event-parser');
const silentLogger  = require('./helpers/silentLogger');

describe('S3EventParser.validateS3NotificationObject', () => {
  it('should fail if event is not correctly formatted', () => {
    expect(() => S3EventParser.validateS3NotificationObject({})).to.throw();
  });
  it('should succeed if event is  correctly formatted', () => {
    expect(() => S3EventParser.validateS3NotificationObject({
      object: {key: 'key'},
      bucket: {name: 'name'}
    })).not.to.throw();
  });
});

describe('S3EventParser.getS3NotificationFromEvent', () => {
  it('should fail if event is not correctly formatted', () => {
    expect(() => S3EventParser.getS3NotificationFromEvent()).to.throw();
    expect(() => S3EventParser.getS3NotificationFromEvent({})).to.throw();
    expect(() => S3EventParser.getS3NotificationFromEvent({Records: []})).to.throw();
  });
  it('should fail if event source is unknown', () => {
    expect(() => S3EventParser.getS3NotificationFromEvent({
      Records: [
        {eventSource: 'azure:magicbit'}
      ]
    })).to.throw();
  });
  it('should work with S3', () => {
    const event = {Records: [{eventSource: 'aws:s3'}]};
    expect(() => S3EventParser.getS3NotificationFromEvent(event, silentLogger)).not.to.throw();
  });
  it('should parse S3 notification correctly', () => {
    const randomNotification = 'notif' + (+new Date);

    const result = S3EventParser.getS3NotificationFromEvent({
      Records: [{
        eventSource: 'aws:s3',
        s3:          randomNotification
      }]
    }, silentLogger);

    expect(result).to.be.equal(randomNotification);
  });
  it('should parse SNS notification correctly', () => {
    const randomNotification = 'notif' + (+new Date);
    const event              = {
      Records: [{
        EventSource: 'aws:sns',
        Sns:         {
          Message: JSON.stringify({
            Records: [{
              eventSource: 'aws:s3',
              s3:          randomNotification
            }]
          })
        }
      }]
    };
    const result             = S3EventParser.getS3NotificationFromEvent(event, silentLogger);
    expect(result).to.be.equal(randomNotification);
  });
});
