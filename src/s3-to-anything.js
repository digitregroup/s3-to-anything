const util  = require('util');
const async = require('async');

const S3EventParser = require('./s3-event-parser');

class S3ToAnything {

  /**
   * @param {Object} event Event sent by S3
   * @param {{log: function, info: function, error: function}} [customLogger] Custom logger
   */
  constructor(event, customLogger) {
    this.logger = customLogger || console;

    this.logger.log('Reading options from event:\n', util.inspect(event, {depth: 5}));
    this.observers = [];

    const S3Event = S3EventParser.parse(event, customLogger);

    this.srcBucket = S3Event.bucketName;
    this.srcKey    = S3Event.filePath;
    this.keyPrefix = S3Event.filePrefix;

    this.logger.log('srcBucket :\n', this.srcBucket);
    this.logger.log('srcKey :\n', this.srcKey);
    this.logger.log('keyPrefix :\n', this.keyPrefix);
  }

  /**
   * Perform the whole process of synchronization
   *
   * @param {function} [callback] Callback Function called at the end of the process
   * @return {*} callback return or async.waterfall object
   */
  process(callback) {
    const next = callback || (() => null);

    // Check if the current file must be processed
    if (!this.isProcessAllowed()) {
      return next('File prefix not supported. Skiping process.', true);
    }

    this.logger.log('Processing');

    return async.waterfall([
      next => this.downloadFile(next),
      (data, next) => this.notifyObservers(data, next),
    ],
    (err) => { // On done
      if (err) {
        this.logger.error(err);

        return next(err);
      } else {
        this.logger.log('Process completed.');

        return next(null, true);
      }
    });
  }

  /**
   * @param {Object} data JSON file
   * @param {function} next Callback
   * @return {function} Next()
   */
  notifyObservers(data, next) {
    this.observers.map(observer => observer(data));

    return next(null, data);
  }

  /**
   * Set the S3 client that will be responsible for downloading objects
   * @param {S3Client} client S3 client
   * @return {S3ToAnything} Fluent setter
   */
  setS3Client(client) {
    this.s3Client = client;

    return this;
  }

  /**
   * Download file notified in the event from S3
   *
   * @param {function} next Function called at the end of file downloading attempt
   * @return {Request<S3.GetObjectOutput, AWSError>} AWS S3 client request object
   */
  downloadFile(next) {
    if (undefined === this.s3Client) {
      throw new Error('S3Client has not been set.');
    }
    // Download the file from S3 into a buffer.
    this.logger.info('Download file from S3');

    return this.s3Client.download(this.srcBucket, this.srcKey, next);
  }

  /**
   * Adds an observer that will be notified when the file has been downloaded and read
   * @param {function} observer Callback to be executed with the read file
   * @return {S3ToAnything} Fluent setter
   */
  addObserver(observer) {
    this.observers.push(observer);

    return this;
  }

  /**
   * Check if the file must be processed or not
   * @return {boolean} return true if the file must be processed
   */
  isProcessAllowed() {
    return this.keyPrefix === process.env.S3_ALLOWED_PREFIX;
  }
}

module.exports = S3ToAnything;
