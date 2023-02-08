# Madison Bikes Bike Week Backend

## Information

This server moves information from a [Gravity Forms](https://www.gravityforms.com/) form hosted on Wordpress and
creates/updates session on an event in the [Sched](https://sched.com/) platform.

It also provides APIs for use in the administration web UI.

The Sched components will automatically throttle API calls to meet [limits defined in their API documentation](https://sched.com/api) (30 calls/minute).

Uses Node 16 LTS, Typescript, superagent for HTTP/REST, tsyringe for dependency injection, pm2 for daemon/process management

## Command line

`npm run start` - runs in daemon mode and polls the GF for changes every 10 minutes

`npm run pm2-start` - runs with pm2 process management (for deployment)

`npm run pm2-stop` - kills pm2-started process

## Environment

Several environment variables must be set, or even better a `.env` file should be created:

- `GF_URI` - set to your base URL for the server where your Gravity Forms is hosted, must be HTTPS (
  e.g. https://www.madisonbikes.org/)
- `GF_FORM_ID` - set to the form ID of the form
- `GF_CONSUMER_API_KEY` - see [Gravity Forms documentation](https://docs.gravityforms.com/rest-api-v2-authentication/),
  this key is used with basic authentication against the server
- `GF_CONSUMER_SECRET` - see [Gravity Forms documentation](https://docs.gravityforms.com/rest-api-v2-authentication/),
  this secret is used with basic authentication against the server
- `SCHED_API_KEY` (set to your Sched API key)
- `SCHED_URI` (set to your base Sched endpoint, e.g. https://madisonbikeweek2022.sched.com)
- `ENABLE_CORS` (set to true if bikeweek-client and bikeweek-server are not being served from same port and host, normally only development)
- `JSONWEBTOKEN_SECRET` - Set this to a long string of random digits or words unique to the server. Used to secure JWT tokens.
- `PORT` - change the port on which the server runs. Default is 3001.
- `STATIC_ROOT_DIR` - set to the location of the bikeweek-server build directory. Used in production to serve both APIs and React client from same host/port.

## Code

This repository enforces [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) as of July 2022.
