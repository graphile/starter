# @app/db/\_\_tests\_\_

Database tests are organised into
`@app/db/__tests__/[schema]/[type]/[name].test.ts` files. If you do not name
your test ending with `.test.ts` then it will not run.

Tests are ran using `jest -i` inline mode so that only one test runs at a time,
this is to prevent rare database deadlocks when running the test suite. In
future we may build a way to run the tests against a swarm of databases which
will remove this restriction, but for now it is necessary to ensure
deterministic tests.

## jest.watch.hack.ts

We're running `jest` in `--watch` mode, so it only tests files that are affected
by changes since the last commit. Since jest cannot look into our database to
see what tests are relevant to run, we make database tests dependent on this
"hack" file, which we then update with a timestamp to force the database tests
to run on database changes. When the tests run, we then reset this file back to
its unmodified state to prevent the tests running again.

Never commit changes to this file.
