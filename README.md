# S3 To Anything

[![CircleCI](https://circleci.com/bb/digitregroup/s3-to-anything.svg?style=shield)](https://circleci.com/bb/digitregroup/s3-to-anything)

Trigger any action when a new file is dropped into a S3 bucket.
S3ToAnything parses S3 file events and triggers your callbacks, if your constraints are met.

### Code style
This project should respect the linting configured in [@digitregroup/eslint-config](https://www.npmjs.com/package/@digitregroup/eslint-config).
```bash
  yarn lint
```

### Continuous Integration / Delivery
This project is completely managed by [CircleCI](https://circleci.com/bb/digitregroup/s3-to-anything) to perform:

  * CI on every git push
    * Linting
    * Unit test (coming soon)
  * CD on `develop` branch and git `tags` (if CI passed)
    * A push to `develop` branch will deploy `stage` environments
    * A git `tag` created will deploy `prod` environments
