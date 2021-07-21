# bikeweek2021-importer

## Information

This tool moves information from a [Gravity Forms](https://www.gravityforms.com/) form hosted on Wordpress and
creates/updates session on an event in the [Sched](https://sched.com/) platform.

The Sched components will automatically throttle API calls to meet [limits defined in their API documentation](https://sched.com/api) (30 calls/minute).

Uses Node 14 LTS, Typescript, superagent for HTTP/REST, tsyringe for dependency injection, pm2 for daemon/process management
## Command line

`npm run exec` - runs one time

`npm run start` - runs in daemon mode and polls the GF for changes every 5 minutes
`npm run pm2-start` - runs with pm2 process management (for deployment)
`npm run pm2-stop` - kills pm2-started process

## Environment

Several environment variables must be set, or even better a `.env` file should be created:

* `GF_URI` - set to your base URL for the server where your Gravity Forms is hosted, must be HTTPS (
  e.g. https://www.madisonbikes.org/)
* `GF_FORM_ID` - set to the form ID of the form
* `GF_CONSUMER_API_KEY` - see [Gravity Forms documentation](https://docs.gravityforms.com/rest-api-v2-authentication/),
  this key is used with basic authentication against the server
* `GF_CONSUMER_SECRET` - see [Gravity Forms documentation](https://docs.gravityforms.com/rest-api-v2-authentication/),
  this secret is used with basic authentication against the server
* `SCHED_API_KEY` (set to your Sched API key)
* `SCHED_URI` (set to your base Sched endpoint, e.g. https://madisonbikeweek2021.sched.com)