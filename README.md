# PostGraphile Starter

## PROPRIETARY SOFTWARE

This repository is NOT open source software. It is proprietary and confidential.

**Unauthorized copying of these files, via any medium, is strictly prohibited without a separate written license to do so from Graphile Ltd.**

## Getting started

```
yarn
yarn setup
yarn dev
```

## Features

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
