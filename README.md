# PostGraphile Starter

You should replace this README with your own.

## PROPRIETARY SOFTWARE

This is NOT open source software. It is proprietary and confidential.

**Unauthorized copying of these files, via any medium, is strictly prohibited without a separate written license to do so from Graphile Ltd.**

This software references other software (including, but not limited to, that
referenced in `package.json` and `yarn.lock`) which has its own licenses — it
is your responsibility to review the licenses of the referenced software and
ensure you are happy with their terms.

## Scope

The intention of this software is that you will take the ideas and concepts
in it and incorporate them into their own project, or build your project on
top of this software. Please note that this software is not "complete," free
of software defects, or free of security issues — it is not a finished
solution, but rather the seed of a solution which you should review,
customise, fix, and develop further.

## Getting started

First, you need to install the dependencies with `yarn`. If you don't have
`yarn` installed, you can install it with `npm install -g yarn`.

```
yarn
```

Next you need to configure a database to use with the project, with the `yarn setup`
command. We currently expect you to run the database on the same computer as
the development environment, if this is not the case (or if it is tucked away
in a VM or a container) you may have some issues - get in touch and we can
help you resolve them.

```
yarn setup
```

Finally you can run the various parts of the system with the `yarn dev` command:

```
yarn dev
```

This runs the various dependencies in parallel.

## Features

Checked features have been implemented, unchecked features are goals for the future.

- [x] **TypeScript** — make your project maintainable by starting with strong typing throughout
- [x] **GraphQL** — on the backend through PostGraphile, on the frontend via Apollo client
- [x] **PostGraphile configured for lean schema** — very tidy GraphQL schema, adhering to PostGraphile best practices
- [x] **Error codes** — specification of existing error codes, examples of them being used, and space to add more
- [x] **Express server** — with easy to customise and understand middleware system
- [x] **Sessions** — to persist login information in the traditional way (with cookies)
- [x] **Job queue** — we've added <a href="https://github.com/graphile/worker">graphile-worker</a> to perform background tasks for you, such as sending emails
- [x] **Responsive email templates** — we've added MJML and a templating system to help you format emails; all emails go through the `send_email` worker task so it's easy to customise
- [x] **Email transport** — we've configured nodemailer to use ethereal.email to catch all development emails, and AWS' SES in production (easy to replace with a different provider)
- [x] **User system** — supporting both username/password registration and OAuth / social authentication (Twitter, GitHub, Facebook, ...)
  - [x] Register via email with sensible validation and error handling
  - [x] Register via social
  - [x] Verify email flow
  - [x] Handle errors in email verification flow
  - [x] Login
  - [x] Email management (add more, delete old, change primary, resend verification)
  - [x] `User.isVerified` to check they have at least on verified email (can use this to govern further permissions)
  - [x] Update profile information
  - [x] Change password flow
  - [x] Forgot password flow
  - [ ] Unlinking social profiles
- [x] **Ant Design** — &ldquo;A design system with values of Nature and Determinacy for better user experience of enterprise applications&rdquo;
- [x] **Hot reloading** — edit a component and it's re-rendered immediately (warning: state is _not_ restored, because this typically leads to instability); provided by Next.js
- [x] **SSR with hot reloading** — if you turn JS off and reload the page you should be greeted with the same content anyway; provided by Next.js
- [x] **Prettier** — consistent automated formatting for your code
- [x] **Linting** — provided by ESLint (and TypeScript-ESLint), can be extended with extremely powerful lint rules to protect your project from bugs, bad practices, and inconsistencies; configured with sensible but not too intrusive defaults
- [x] **Migrations** — we use <a href="https://github.com/graphile/migrate">graphile-migrate</a> but you're welcome to switch to whatever migration library you like
- [x] **HTML→text emails** — automated conversion from your pretty templates to plain text emails for users that prefer that
- [x] **Form validation** — using AntD's `Form` component
- [ ] **File uploads** — user can change their avatar, but this approach can be extended to other areas
- [ ] **Realtime** — PostGraphile is configured with @graphile/pg-pubsub to enable realtime events from the DB; and Apollo is configured to consume them
- [ ] **Testing** — Jest configured to test the database and the GraphQL API
- [ ] **Acceptance testing** — TODO
- [ ] **Production build** — command to generate a production build of the project
- [ ] **Deployment instructions: Heroku** — how to deploy to Heroku
- [ ] **Deployment instructions: Docker** — how to deploy with Docker
