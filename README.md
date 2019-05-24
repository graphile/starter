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
in a VM or a container) you may have some issues - if so, get in touch and we
can help you resolve them.

```
yarn setup
```

The above command will create a `.env` file for you containing all your
secrets. Do not commit it! Finally you can run the various parts of the system
(see below) with the `yarn dev` command:

```
yarn dev
```

This runs the various dependencies in parallel using `concurrently`.

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
  - [x] Unlinking social profiles
- [x] **Ant Design** — &ldquo;A design system with values of Nature and Determinacy for better user experience of enterprise applications&rdquo;
- [x] **Hot reloading** — edit a component and it's re-rendered immediately (warning: state is _not_ restored, because this typically leads to instability); provided by Next.js
- [x] **SSR with hot reloading** — if you turn JS off and reload the page you should be greeted with the same content anyway; provided by Next.js
- [x] **Prettier** — consistent automated formatting for your code
- [x] **Linting** — provided by ESLint (and TypeScript-ESLint), can be extended with extremely powerful lint rules to protect your project from bugs, bad practices, and inconsistencies; configured with sensible but not too intrusive defaults
- [x] **Migrations** — we use <a href="https://github.com/graphile/migrate">graphile-migrate</a> but you're welcome to switch to whatever migration library you like
- [x] **HTML→text emails** — automated conversion from your pretty templates to plain text emails for users that prefer that
- [x] **Form validation** — using AntD's `Form` component
- [x] **Realtime** — PostGraphile is configured with @graphile/pg-pubsub to enable realtime events from the DB; and Apollo is configured to consume them
- [x] **Production build** — command to generate a production build of the project using `npm run build`
- [ ] **Testing** — Jest configured to test the database and the GraphQL API
- [ ] **Deployment instructions: Heroku** — how to deploy to Heroku

## TODO

Here's some more things we'd like to demonstrate that we've not got around to yet. (If you're interested in helping, reach out on Discord: http://discord.gg/graphile)

- [ ] **File uploads** — user can change their avatar, but this approach can be extended to other areas
- [ ] **Acceptance testing** — TODO
- [ ] **Docker development flow** — how to work on this project using Docker (rather than running the code/servers directly)
- [ ] **Deployment instructions: Docker** — how to deploy with Docker

## Documentation links

The `yarn dev` command runs a number of tasks:

- `db`: uses [`graphile-migrate`](https://github.com/graphile/migrate) to watch the `migrations/current.sql` file for changes, and automatically runs it against your database when it changes
- `server:src`: watches the TypeScript source code of the server, and compiles it from `server/src` to `server/dist` so node and `graphile-worker` can run the compiled code directly
- `server:run`: runs the node server that contains, among other things, PostGraphile and Next.js
- `worker`: runs `graphile-worker` to execute your tasks
- `codegen`: watches your GraphQL files and your PostGraphile schema for changes and generates your TypeScript components/HOCs/etc for you automatically (to save you having to write all the generics yourself)

We use Next.js ([docs](https://nextjs.org/)) to handle the various common
concerns of a React application for us (server-side rendering, routing,
bundling, bundle-splitting, etc). The `client/src/pages/_app.tsx` file is a
[custom &lt;App&gt;](https://nextjs.org/docs#custom-app) which allows you to
add any providers you need to. We've already set it up with `withApollo` from
`client/src/lib/withApollo` which includes all the Apollo configuration,
including the client URL.

The component library we're using is AntD ([docs](https://ant.design/)); we've
demonstrated how to use the form validation components on the login/register
pages so you can see how to handle errors from the server.

The database is a jumping-off point; customise it as you see fit, and then run
`yarn db:migrate commit` so you can start implementing your own business logic
on top. We deliberately do not include functionality that we don't think you'll
find useful. To read more about migrations with graphile-migrate, see the
[graphile-migrate docs](https://github.com/graphile/migrate).

We've added a few example workers for you, including the `send_email` worker
which performs email templating for you. See `server/src/worker/tasks` for the
tasks we've created (and to add your own), and see the [graphile-worker
docs](https://github.com/graphile/worker) for more information.

The server entry point is `server/src/server/index.ts`; you'll see that it
contains documentation and has split the middleware up into a manageable
fashion. We use traditional cookie sessions, but you can switch this out
for an alternative.

If you set `GITHUB_KEY` and `GITHUB_SECRET` in your `.env` file then you can
also use GitHub's OAuth social authentication; you can add similar logic to the
GitHub logic (in `server/src/server/middleware/installPassport.ts`) to enable
other social login providers such as Twitter, Facebook, Google, etc. For more
information, see the [passport.js
documentation](http://www.passportjs.org/docs/).

## Deploying to Heroku

First set up your database server; we recommend using Amazon RDS.

Once your RDS server is running, you can use our `heroku-setup` script to
automate the setup process. This script does the following:

- Creates the Heroku app
- Adds the redis extension to this heroku app
- Creates the database in the database server
- Creates the relevant roles, generating random passwords for them
- Installs some common database extensions
- Sets the Heroku config variables
- Adds the heroku app as a git remote named 'heroku'
- Pushes the 'master' branch to Heroku to perform your initial build

First copy `heroku-setup.template` to `heroku-setup`, then edit it and
customise the settings at the top. We also recommend reading through the
script and customising it as you see fit - particularly if you are using
additional extensions that need installing.

Finally, run the script:

```
bash heroku-setup
```

Hopefully all has gone well. If not, step through the remaining tasks in the
heroku-setup script and fix each task as you go. We've designed the script so
that if your superuser credentials are wrong, or the heroku app already exists,
you can just edit the settings and try again. All other errors will probably
need manual intervention.

To delete the heroku app:

```
heroku apps:delete $APP_NAME
```
