const path = require('path');
const Joi  = require('joi');

const handleJoiError = require('./handle-joi-error')('S3EventParser');

const S3EventParser = class {
  /**
   * Parse an event and returns details
   * @param {Object} event Event sent by S3
   * @returns {{bucketName, filePath: string, filePrefix: string}} Parsed S3 event
   */
  static parse(event) {

    // Get the S3 notification object from AWS S3 or SNS event
    const s3NotifObject = S3EventParser.getS3NotificationFromEvent(event);

    // Validate the S3 notification object
    S3EventParser.validateS3NotificationObject(s3NotifObject);

    // Parse file path (key)
    const filePath = decodeURIComponent(s3NotifObject.object.key.replace(/\+/g, ' '));

    return {
      filePath,
      // Parse bucket name
      bucketName: s3NotifObject.bucket.name,
      // Parse file prefix
      filePrefix: path.dirname(filePath)
    };

  }

  /**
   * Validates the S3 notification object coming from the event
   * @param {Object} s3NotifObject S3 notification object
   * @returns {void}
   */
  static validateS3NotificationObject(s3NotifObject) {
    const schema = Joi.object().keys({
      object: Joi.object().keys({
        key: Joi.string().required()
      })
        .required(),
      bucket: Joi.object().keys({
        name: Joi.string().required()
      })
        .required()
    })
      .required();

    Joi.validate(s3NotifObject, schema, {allowUnknown: true}, handleJoiError);
  }

  /**
   * Extract the S3 notification object from the AWS S3 or SNS Event
   * @param {Object} event AWS S3/SNS Event
   * @return {Object|null|false} Return the s3 Notification object if found,
   *                             otherwise return null/false is the event payload is not supported
   */
  static getS3NotificationFromEvent(event) {
    let s3Notification = null;

    if (event.Records && event.Records[0]) {
      switch (event.Records[0].eventSource || event.Records[0].EventSource) {
        case 'aws:s3':
          console.log('Parsing from aws:s3 event.');
          s3Notification = event.Records[0].s3;
          break;
        case 'aws:sns':
          console.log('Parsing from aws:sns event.');
          s3Notification = S3EventParser.getS3NotificationFromEvent(JSON.parse(event.Records[0].Sns.Message));
          break;
        default:
          throw new Error(
            'Unsupported AWS Event Source: ' +
            event.Records[0].eventSource || event.Records[0].EventSource
          );
      }
    } else {
      throw new Error('Wrong AWS Event payload.');
    }

    return s3Notification;
  }
};

module.exports = S3EventParser;
