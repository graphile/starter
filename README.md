# PostGraphile Starter

## Purpose

Take this software and use it as the starting point to build your project. Go
make some money, and [give something
back](https://github.com/users/benjie/sponsorship) to support us building
more tools and kits for the Node, GraphQL and PostgreSQL ecosystems.

Please note that this software is not "complete," free of software defects,
or free of security issues — it is not a "finished" solution, but rather the
seed of a solution which you should review, customise, fix, and develop
further.

It is intended that you use a "point in time" version of this software ─ it
is not intended that you can merge updates to this software into your own
derivative in an automated fashion.

<!-- SPONSORS_BEGIN -->

## Crowd-funded open-source software

We license our software under the MIT license to give you a huge amount of
freedom in how you use it. However, it takes a lot of time to produce and
maintain software, and it wouldn't be possible without the help of [our
wonderful sponsors](https://www.graphile.org/sponsor/).

We'd love to spend more time on open source, building tools that will save
you and others even more time and money ─ but to make this kind of
development sustainable we need your help. Please sponsor our open source
efforts:

### [Click here to find out more about sponsors and sponsorship.](https://www.graphile.org/sponsor/)

And please give some love to our featured sponsors 🤩:

<table><tr>
<td align="center"><a href="http://chads.website/"><img src="https://www.graphile.org/images/sponsors/chadf.png" width="90" height="90" alt="Chad Furman" /><br />Chad Furman</a></td>
<td align="center"><a href="https://timescale.com/"><img src="https://www.graphile.org/images/sponsors/timescale.svg" width="90" height="90" alt="Timescale" /><br />Timescale</a></td>
<td align="center"><a href="http://p72.vc/"><img src="https://www.graphile.org/images/sponsors/p72.png" width="90" height="90" alt="Point72 Ventures" /><br />Point72 Ventures</a></td>
</tr></table>

<!-- SPONSORS_END -->

## Goals

- Easy to start
- Batteries included
  - User registration, login, forgot password, email management, settings, etc
  - AntD design framework
  - Preconfigured everything
- Development speed
  - Hot reloading where possible, auto-restart where not
  - Code formatting, linting, type-checking all pre-configured
  - Re-run relevant tests (even database tests) on changes
  - Idempotent migration system
  - Strongly typed throughout
  - Servers and clients set up for easy debugging (e.g. via `chrome://inspect`)
  - Sensibly laid out source-code, including middleware system
- VSCode integration (optional)
  - Plugin recommendations
  - Preconfigured settings
  - ESLint and Prettier integration (without conflicts)
  - Debugging profiles for node server, worker and frontend
- Best practices
  - GraphQL best practices
  - PostGraphile best practices
  - Testing best practices
  - Node best practices
- Well tested
- Simple (just node server and database, no additional services required)
- Security
  - Using [RLS](https://learn.graphile.org/docs/PostgreSQL_Row_Level_Security_Infosheet.pdf)
- Scalable
  - extremely high performance
  - optionally separate out job queue
  - optionally separate out SSR
  - optional redis session store

## Prerequisites

- Node.js v10+ must be installed
- Either a PostgreSQL v10+ server must be available, or Docker and docker-compose must be available
- VSCode is recommended, but any editor will do

This software has been developed under Mac and Linux, and should work in a
`bash` environment. I'm not sure if it works under Windows; PRs to fix
Windows compatibility issues would be welcome (please keep them small!).

For users of Visual Studio Code (VSCode), a `.vscode` folder is included with
editor settings and debugger settings provided, plus a list of recommended
extensions.

## Getting started

This project is designed to work with `yarn`. If you don't have `yarn`
installed, you can install it with `npm install -g yarn`.

To get started, please run the `yarn setup` command which should lead you
through the necessary steps:

```
yarn setup
```

The above command will create a `.envvar` file for you containing your secrets.
Do not commit it to version control!

## Running

Depending on how you answered the setup questions, you can bring up the stack:

- natively: `yarn dev`
- with Docker: `docker-compose up`

After a short period you should then be able to load the application at
http://localhost:5678

**Be careful not to mix and match Docker-mode vs local-mode.** You should
stick with the answer you gave during setup.

## Features

Checked features have been implemented, unchecked features are goals for the future.

- [x] **TypeScript** — make your project maintainable by starting with strong typing throughout
- [x] **React hooks** — modern react code
- [x] **GraphQL** — on the backend through PostGraphile, on the frontend via Apollo client
- [x] **Autogenerated Type-safe GraphQL Hooks** — using `graphql-code-generator` to turn your GraphQL queries and mutations into strongly typed React hooks instantly
- [x] **PostGraphile configured for lean schema** — very tidy GraphQL schema, adhering to PostGraphile best practices
- [x] **Autoformatting** ─ Thanks to `prettier` and `eslint`, code can be auto-formatted (and auto-fixed) on save
- [x] **Job queue** — we've added and configured <a href="https://github.com/graphile/worker">graphile-worker</a> to perform background tasks for you, such as sending emails, and included some example tasks
- [x] **Express server** — with Benjie's [easy to customise and understand middleware system](backend/src/server/index.ts)
- [x] **Debugability** ─ The server, worker, tests and client are all ready to be debugged using [VSCode's built in breakpoints](https://code.visualstudio.com/docs/editor/debugging)
- [x] **Hot reloading** — edit a component and it's re-rendered immediately (warning: state is _not_ restored, because this typically leads to instability); provided by Next.js
- [x] **SSR with hot reloading** — if you turn JS off and reload the page you should be greeted with the same content anyway; provided by Next.js
- [x] **Productive roll-forward migrations** — we use <a href="https://github.com/graphile/migrate">graphile-migrate</a> for development speed, but you're welcome to switch to whatever migration library you like
- [x] **Realtime** — PostGraphile is configured with `@graphile/pg-pubsub` to enable realtime events from the DB; and Apollo is configured to consume them
- [x] **Production build** — command to generate a production build of the project using `npm run build`
- [x] **Production Docker build** — how to build a Docker image you could use in production
- [x] **Deployment instructions: Heroku** — how to deploy to Heroku
- [x] **Database tests** — Jest configured to test the database, plus initial tests for various database functions and tables
- [x] **GraphQL tests** — Jest configured to test the GraphQL schema, plus some initial tests
- [x] **Acceptance tests** — implemented with Cypress
- [x] **Docker development flow** — enables work on this project using Docker (rather than running the Postgres/etc directly on your machine)
- [x] **Documented error codes** — specification of existing error codes, examples of them being used, and space to add more
- [x] **Prebuilt user system** — supporting both username/password registration and OAuth / social authentication (Twitter, GitHub, Facebook, ...)
  - [x] Register via email with sensible validation and error handling
  - [x] Register via social
  - [x] Verify email flow
  - [x] Handle errors in email verification flow
  - [x] Login (with mixed case username/email, or via social)
  - [x] Email management (add more, delete old, change primary, resend verification)
  - [x] `User.isVerified` to check they have at least on verified email (can use this to govern further permissions)
  - [x] Update profile information
  - [x] Change password flow
  - [x] Forgot password flow
  - [x] Unlinking social profiles
- [x] **Sessions** — to persist login information in the traditional way (with cookies)
- [x] **Responsive email templates** — we've added MJML and a templating system to help you format emails; all emails go through the `send_email` worker task so it's easy to customise
- [x] **Email transport** — we've configured nodemailer to use ethereal.email to catch all development emails, and AWS' SES in production (easy to replace with a different provider thanks to nodemailer)
- [x] **Ant Design** — &ldquo;A design system with values of Nature and Determinacy for better user experience of enterprise applications&rdquo;
- [x] **Linting** — provided by `eslint`, `prettier` and `@typescript-eslint`. Can be extended with extremely powerful lint rules to protect your project from bugs, bad practices, and inconsistencies; configured with sensible but not too intrusive (hopefully) defaults focussed on GraphQL development
- [x] **HTML→text emails** — automated conversion from your pretty templates to plain text emails for users that prefer that
- [x] **Form validation** — using AntD's `Form` component

## TODO

Here's some more things we'd like to demonstrate that we've not got around to yet. (If you're interested in helping, reach out on Discord: http://discord.gg/graphile)

- [ ] **File uploads** — user can change their avatar, but this approach can be extended to other areas

## Documentation links

### yarn dev

The `yarn dev` command runs a number of tasks:

- `db:watch`: uses [`graphile-migrate`](https://github.com/graphile/migrate) to watch the `migrations/current.sql` file for changes, and automatically runs it against your database when it changes
- `server:src:watch`: watches the TypeScript source code of the server, and compiles it from `backend/src` to `backend/dist` so node and `graphile-worker` can run the compiled code directly
- `server:watch`: runs the node server (includes PostGraphile and Next.js middlewares)
- `server:worker:watch`: runs `graphile-worker` to execute your tasks (e.g. sending emails)
- `codegen:watch`: watches your GraphQL files and your PostGraphile schema for changes and generates your TypeScript React hooks for you automatically, leading to strongly typed code with minimal effort
- `test:watch`: runs the `jest` tests in watch mode, automatically re-running as the database or test files change

### Cypress e2e tests

Thanks to Cypress.io for sponsoring this work, we've added e2e tests covering
loading the various pages, registering an account, logging in, verifying and
managing your emails. You should be able to easily build on top of these
tests to ensure that your project remains rock-solid at all times.

### Next.js

We use Next.js ([docs](https://nextjs.org/)) to handle the various common
concerns of a React application for us (server-side rendering, routing,
bundling, bundle-splitting, etc). The `client/src/pages/_app.tsx` file is a
[custom &lt;App&gt;](https://nextjs.org/docs#custom-app) which allows you to
add any providers you need to. We've already set it up with `withApollo` from
`client/src/lib/withApollo` which includes all the Apollo configuration,
including the client URL.

### AntD

The component library we're using is AntD ([docs](https://ant.design/)); we've
demonstrated how to use the form validation components on the login/register
pages so you can see how to handle errors from the server.

### Initial database

The database is a jumping-off point; we've already committed the initial user
system for you (but you can `uncommit` this if you need to). You can add
idempotent SQL commands to `migrations/current.sql` and they will run when
you save. When you're happy with your changes, run `yarn db:migrate commit`
to commit these commands and reset `migrations/current.sql` to a blank state
ready for the next batch of changes. We deliberately do not include
functionality that we don't think most users will find useful.

### graphile-migrate

To read more about migrations with graphile-migrate, see the
[graphile-migrate docs](https://github.com/graphile/migrate).

### graphile-worker

We've added a few example workers for you, including the `send_email` worker
which performs email templating for you. See `backend/src/worker/tasks` for the
tasks we've created (and to add your own), and see the [graphile-worker
docs](https://github.com/graphile/worker) for more information.

### Server

The server entry point is `backend/src/server/index.ts`; you'll see that it
contains documentation and has split the middleware up into a manageable
fashion. We use traditional cookie sessions, but you can switch this out
for an alternative.

### Login with GitHub

If you set `GITHUB_KEY` and `GITHUB_SECRET` in your `.envvar` file then you can
also use GitHub's OAuth social authentication; you can add similar logic to the
GitHub logic (in `backend/src/server/middleware/installPassport.ts`) to enable
other social login providers such as Twitter, Facebook, Google, etc. For more
information, see the [passport.js documentation](http://www.passportjs.org/docs/).

## Making it yours

1. Download and extract a zip of [the latest release from GitHub](https://github.com/graphile/starter/releases)
1. In that folder run:
   - `git init`
   - `git add .`
   - `git commit -m "PostGraphile starter base"`
1. Change the project name in `package.json`
1. Change the project settings in `backend/src/config.ts`
1. Replace the `README.md` file
1. Commit as you usually would
1. [Show your appreciation with sponsorship](https://www.graphile.org/sponsor/)

## Docker development notes

Docker creates the files in `.docker` as root. As these files are owned by
root you have to `sudo` to deal with them. 🙄

PostgreSQL logs from Docker on stdout were overwhelming so we now write them
to the Postgres data directory `.docker/postgres_data/logs/`. We've enabled
`log_truncate_on_rotation` but you may need to prune these periodically. See
[log file
maintenance](https://www.postgresql.org/docs/current/logfile-maintenance.html).

Our Docker setup seems to trigger more watch events than the native one, so
it seems to do more redundant work/produce more output. A PR to fix this
would be welcome!

## Building the production docker image

To build the production image, use `docker build`. You should supply the
`ROOT_DOMAIN` and `ROOT_URL` build variables (which will be baked into the
client code, so cannot be changed as envvars); if you don't then the defaults
will apply (which likely will not be suitable).

To build the worker, pass `TARGET="worker"` instead of the default
`TARGET="server"`.

```sh
docker build \
  --build-arg ROOT_DOMAIN="localhost:5678" \
  --build-arg ROOT_URL="http://localhost:5678" \
  --build-arg TARGET="server" \
  .
```

When you run the image you must pass it the relevant environmental variables, for example:

```sh
docker run --rm -it --init -p 5678:5678 \
  -e GRAPHILE_LICENSE="$GRAPHILE_LICENSE" \
  -e SECRET="$SECRET" \
  -e JWT_SECRET="$JWT_SECRET" \
  -e DATABASE_VISITOR="$DATABASE_VISITOR" \
  -e DATABASE_URL="$DATABASE_URL" \
  -e AUTH_DATABASE_URL="$AUTH_DATABASE_URL" \
  -e GITHUB_KEY="$GITHUB_KEY" \
  -e GITHUB_SECRET="$GITHUB_SECRET" \
  docker-image-id-here
```

Currently if you miss required envvars weird things will happen; we don't
currently have environment validation (PRs welcome!).

## Deploying to Heroku

If you are using `graphile-migrate` make sure that you have executed
`graphile-migrate commit` to commit all your database changes, since we only
run committed migrations in production.

Make sure you have customised `backend/src/config.ts`.

Make sure everything is committed and pushed in git.

Set up a database server; we recommend using Amazon RDS.

Once your database server is running, you can use our `heroku-setup` script to
automate the setup process. This script does the following:

- Creates the Heroku app
- Adds the redis extension to this heroku app
- Creates the database in the database server
- Creates the relevant roles, generating random passwords for them
- Installs some common database extensions
- Sets the Heroku config variables
- Adds the heroku app as a git remote named 'heroku'
- Pushes the 'master' branch to Heroku to perform your initial build

Copy `heroku-setup.template` to `heroku-setup`, then edit it and customise the
settings at the top. We also recommend reading through the script and
customising it as you see fit - particularly if you are using additional
extensions that need installing.

Now run the script:

```
bash heroku-setup
```

Hopefully all has gone well. If not, step through the remaining tasks in the
heroku-setup script and fix each task as you go. We've designed the script so
that if your superuser credentials are wrong, or the heroku app already exists,
you can just edit the settings and try again. All other errors will probably
need manual intervention. Verbosity is high so you can track exactly what
happened.

The server should be up and running now (be sure to access it over HTTPS
otherwise you will not be able to run GraphQL queries), but it is not yet
capable of sending emails. To achieve this, you must configure an email
transport. We have preconfigured support for Amazon SES. Once SES is set up,
your domain is verified, and you've verified any emails you wish to send email
to (or have had your sending limits removed), make sure that the `fromEmail` in
`backend/src/config.ts` is correct, and then create an IAM role for your
PostGraphile server. Here's an IAM template for sending emails - this is the
only permission required for our IAM role currently, but you may wish to add
others later.

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "ses:SendRawEmail",
            "Resource": "*"
        }
    ]
}
```

Generate an Access Key for this IAM role, and then tell Heroku the access key
id and secret:

```
heroku config:set AWS_ACCESS_KEY_ID="..." AWS_SECRET_ACCESS_KEY="..." -a $APP_NAME
```

Now you can tell Heroku to run the worker process as well as the currently running 'web' process:

```
heroku ps:scale worker=1 -a $APP_NAME
```

When you register an account on the server you should receive a verification
email containing a clickable link. When you click the link your email will be
verified and thanks to GraphQL subscriptions the previous tab should be updated
to reflect that your account is now verified.

**Remember** the first account registered will be an admin account, so be sure
to register promptly.

You can also configure your application for social login. This works the same
as in development except the callback URL will be different, something like
`https://MY_HEROKU_APP_NAME.herokuapp.com/auth/github/callback`. Set the GitHub
OAuth secrets on your Heroku app to trigger a restart and enable social login:

```
heroku config:set GITHUB_KEY="..." GITHUB_SECRET="..." -a $APP_NAME
```

## Cleanup

To delete the Heroku app:

```
heroku apps:destroy -a $APP_NAME
```

To delete the database/roles (replace `dbname` with your database name):

```
drop database dbname;
drop role dbname_visitor;
drop role dbname_authenticator;
drop role dbname;
```

## MIT License

This is open source software; you may use, modify and distribute it under the
terms of the MIT License, see [GRAPHILE_STARTER_LICENSE.md](./GRAPHILE_STARTER_LICENSE.md).
