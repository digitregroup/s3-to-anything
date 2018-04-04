const S3ToAnything = require('./src/s3-to-anything');

const s3Event = {
  Records: [{
    EventSource: 'aws:s3',
    s3:          {
      object: {key: 'prefix/key.ext'},
      bucket: {name: 'bucket.name'}
    }
  }]
};

const s2a = new S3ToAnything();

s2a.addObserver(
  () => console.log('OBSERVED !!!'),
  data => data.filePrefix === 'prefix'
);
s2a.addObserver(
  () => console.log('NOT OBSERVED !!!'),
  data => data.filePrefix === 'wrong'
);
s2a.addObserver(
  () => console.log('OBSERVED AGAIN !!!'),
  data => data.bucketName === 'bucket.name'
);

s2a.addObserver(() => console.log('OBSERVED ALSO !!!'));

// Finally...
s2a.process(s3Event, () => console.log('Everything is over.'));
