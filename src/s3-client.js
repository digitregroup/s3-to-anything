const S3  = require('aws-sdk/clients/s3');
const Joi = require('joi');

const handleJoiError = require('./handle-joi-error')('S3Client');

const S3Client = class {
  /**
   * @param {Object} s3config Configuration
   */
  constructor(s3config) {
    S3Client.validateConfig(s3config);
    this.s3 = new S3(s3config);
  }

  /**
   * Validate S3 config
   * @param {Object} config Configuration to validate
   * @returns {void}
   */
  static validateConfig(config) {
    const schema = Joi.object().keys({
      accessKeyId:     Joi.string().required(),
      secretAccessKey: Joi.string().required(),
    })
      .required();

    Joi.validate(config, schema, handleJoiError);
  }

  /**
   * @param {string} bucket Bucket name
   * @param {string} key Target file key
   * @param {function} callback Callback
   * @return {Request<S3.GetObjectOutput, AWSError>} AWS S3 client request object
   */
  download(bucket, key, callback) {
    return this.s3.getObject({Bucket: bucket, Key: key}, callback);
  }
};

module.exports = S3Client;
