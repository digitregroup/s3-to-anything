const util  = require('util');
const async = require('async');

const S3EventParser = require('./s3-event-parser');

class S3ToAnything {

  /**
   * @param {{log: function, info: function, error: function}} [customLogger] Custom logger
   */
  constructor(customLogger) {
    this.logger    = customLogger || console;
    this.observers = [];
  }

  /**
   * Perform the whole process of synchronization
   * @param {Object} event Event sent by S3
   * @param {function} [finalCallback] Callback Function called at the end of the process
   * @return {*} callback return or async.waterfall object
   */
  process(event, finalCallback) {

    const logger = this.logger;

    logger.log(
      'Reading options from event:\n',
      util.inspect(event, {depth: 5})
    );

    this.eventParams = S3EventParser.parse(event, this.logger);

    logger.log('srcBucket :\n', this.eventParams.bucketName);
    logger.log('srcKey :\n', this.eventParams.filePath);
    logger.log('keyPrefix :\n', this.eventParams.filePrefix);

    logger.log('Processing');

    const next = finalCallback || (() => null);

    return async.waterfall(
      this.notifyObservers(this.eventParams),
      function(err) { // On done
        if (err) {
          logger.error(err);

          return next(err);
        } else {
          logger.log('Process completed.');

          return next(null, true);
        }
      });
  }

  /**
   * Adds an observer that will be notified when the file has been downloaded and read
   * @param {function} observer Callback to be executed with the read file
   * @param {function} [constraint] Constraint to be checked with the Parsed event data
   * @return {S3ToAnything} Fluent setter
   */
  addObserver(observer, constraint) {
    this.observers.push({observer, constraint});

    return this;
  }

  /**
   * @param {Object} data JSON file
   * @return {Function[]} Next()
   */
  notifyObservers(data) {
    return this.observers.map(({observer, constraint}) => (next) => {
      // Check if the current file must be processed
      if (!constraint || constraint(this.eventParams)) {
        observer(data);
      }

      return next(null);
    });
  }
}

module.exports = S3ToAnything;
