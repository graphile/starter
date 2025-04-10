# @app/server

The server is responsible for:

- authentication (via [Passport](http://www.passportjs.org/))
- serving the GraphQL endpoint (via
  [PostGraphile](https://graphile.org/postgraphile/), based on database in
  `@app/db`)
- server-side rendering (SSR) of the `@app/client` thanks to
  [Next.js](https://nextjs.org/)

The server does not perform background tasks such as sending emails, that is the
responsibility of the job queue, which can be found in
[@app/worker](../worker/README.md).

## Entry point

The entry point to the server is [src/index.ts](src/index.ts). This file sets up
an HTTP server and installs our express app (defined in
[src/app.ts](src/app.ts)) into it. The express app installs the middleware it
needs from the src/middleware/\*.ts files.

## Express getters

Commonly-used values are stored into the Express app itself, using Express'
`app.set(key, value)` API. Unfortunately this API does not allow for type-safe
retrieval, so we encourage the use of custom typed getters to retrieve the
relevant values, for example:
`function getHttpServer(app: Express): Server | void { return app.get("httpServer"); }`

## PostGraphile smart tags

`postgraphile.tags.jsonc` is a
[smart tags file](https://www.graphile.org/postgraphile/smart-tags-file/) used
to configure and shape our resulting GraphQL schema. The file is documented
(hence JSONC); we'd like it to be JSON5 eventually (which should be as simple as
renaming the file and having prettier reformat it for us) but VSCode does not
have built-in support for JSON5 currently.

## PostGraphile plugins

Our GraphQL schema uses a number of plugins for enhancements and customizations;
these can be found in [src/plugins](./src/plugins).

## shutdownActions

In development we restart the server quite frequently. We don't want the server
to fail to start when the previous one was killed, so we maintain a list of
`shutdownActions` to cleanly close servers, sockets, files and the like. These
actions are called automatically when the process exits, or is interrupted with
certain signals such as SIGINT from Ctrl-c.
