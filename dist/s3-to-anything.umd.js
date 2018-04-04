!function(e,o){"object"==typeof exports&&"undefined"!=typeof module?module.exports=o():"function"==typeof define&&define.amd?define(o):e.s3ToAnything=o()}(this,function(){var e=require("util"),o=require("async"),t=require("./s3-event-parser"),n=function(o){console.log("Reading options from event:\n",e.inspect(o,{depth:5})),this.observers=[];var n=t.parse(o);this.srcBucket=n.bucketName,this.srcKey=n.filePath,this.keyPrefix=n.filePrefix,console.log("srcBucket :\n",this.srcBucket),console.log("srcKey :\n",this.srcKey),console.log("keyPrefix :\n",this.keyPrefix)};return n.prototype.process=function(e){var t=this,n=e||function(){return null};return this.isProcessAllowed()?(console.log("Processing"),o.waterfall([function(e){return t.downloadFile(e)},function(e,o){return t.notifyObservers(e,o)}],function(e){return e?(console.error(e),n(e)):(console.log("Process completed."),n(null,!0))})):(console.warn("File prefix not supported. Skiping process."),n(null,!0))},n.prototype.notifyObservers=function(e,o){return this.observers.map(function(o){return o(e)}),o(null,e)},n.prototype.setS3Client=function(e){return this.s3Client=e,this},n.prototype.downloadFile=function(e){if(void 0===this.s3Client)throw new Error("S3Client has not been set.");return console.info("Download file from S3"),this.s3Client.download(this.srcBucket,this.srcKey,e)},n.prototype.addObserver=function(e){return this.observers.push(e),this},n.prototype.isProcessAllowed=function(){return this.keyPrefix===process.env.S3_ALLOWED_PREFIX},n});
//# sourceMappingURL=s3-to-anything.umd.js.map