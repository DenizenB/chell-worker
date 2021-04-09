# Abuse.chell worker

A Cloudflare worker that serves as a reverse proxy for abuse.ch exports.

Responses are cached on the worker for 1 hour to adhere to abuse.ch ToS.

## Wrangler

Tested and published with the help of [wrangler](https://github.com/cloudflare/wrangler)
