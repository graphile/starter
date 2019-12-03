# @app/e2e

Our end-to-end tests use [Cypress](https://www.cypress.io/) to test our entire
application stack.

To develop tests; from the root directory, run

```
yarn e2e open
```

This will open the cypress test runner, you can then debug and develop your
tests.

To just run the tests without viewing the UI, use `yarn e2e run`.

During development, the end-to-end tests run against the development server so
that you can benefit from all your usual development enhancements such as hot
reloading, debugger integration, etc.
