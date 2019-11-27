# PostGraphile Starter

## Purpose

Take this software and use it as the starting point to build your project. Go
make some money, and [give something
back](https://graphile.org/sponsor/) to support us building
more tools and kits for the Node, GraphQL and PostgreSQL ecosystems.

Please note that this software is not "complete," free of software defects,
or free of security issues — it is not a "finished" solution, but rather the
seed of a solution which you should review, customize, fix, and develop
further.

It is intended that you use a "point in time" version of this software ─ it
is not intended that you can merge updates to this software into your own
derivative in an automated fashion.

<!-- SPONSORS_BEGIN -->

## Crowd-funded open-source software

**PLEASE DONATE.**

We've put an absolute ton of work into this project to help you to turn
your application idea into a reality as fast as possible. Instead of putting
this code under a complex proprietary license we've made it available to you
under the simple MIT license. This gives you a huge amount of freedom in how
you use it, but it also makes it very hard for us to earn a living from our
hard work.

Work like this wouldn't be possible without the help of [our wonderful
sponsors](https://www.graphile.org/sponsor/); but we need more people to join
their ranks so we can continue to bring about awesome projects like this.
We'd love to spend more time on open source, building tools that will save
you and others even more time and money ─ please sponsor our open source
efforts:

### [Click here to find out more about sponsors and sponsorship.](https://www.graphile.org/sponsor/)

And please give some love to our featured sponsors 🤩:

<table><tr>
<td align="center"><a href="http://chads.website/"><img src="https://www.graphile.org/images/sponsors/chadf.png" width="90" height="90" alt="Chad Furman" /><br />Chad Furman</a></td>
<td align="center"><a href="https://storyscript.io/?utm_source=postgraphile"><img src="https://www.graphile.org/images/sponsors/storyscript.png" width="90" height="90" alt="Storyscript" /><br />Storyscript</a></td>
<td align="center"><a href="http://p72.vc/"><img src="https://www.graphile.org/images/sponsors/p72.png" width="90" height="90" alt="Point72 Ventures" /><br />Point72 Ventures</a></td>
</tr></table>

<!-- SPONSORS_END -->

## Table of contents

- [Goals](#goals)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Running](#running)
- [Features](#features)
- [To do](#todo)
- [Documentation links](#documentation-links)
- [Making it yours](#making-it-yours)
- [Docker development](#docker-development-1)
- [Deploying to Heroku](#deploying-to-heroku)
- [License](#mit-license)


## Goals

PostGraphile Starter is intended as an off-the-shelf stater project which does your application set-up for you. Included is the beginning of an app which uses Node, GraphQL and PostGraphile with a user registration system and the AntD design framework - everything you need to quickly get started with your application idea.

Some of our goals in making this are:

- Easy to start
- Simple (just node server and database, no additional services required)
- Well tested
- Batteries included:
  - User registration, login, forgot password, email management, settings, etc.
  - AntD design framework
  - Preconfigured everything
- Development speed:
  - Hot reloading where possible, auto-restart where not
  - Code formatting, linting, type-checking all pre-configured
  - Re-run relevant tests (even database tests) on changes
  - Idempotent migration system
  - Strongly typed throughout
  - Servers and clients set up for easy debugging (e.g. via `chrome://inspect`)
  - Sensibly laid out source-code, including middleware system
- Best practices:
  - GraphQL best practices
  - PostGraphile best practices
  - Testing best practices
  - Node best practices
- Scalable:
  - extremely high performance
  - optionally separate out job queue
  - optionally separate out SSR
  - optional Redis session store
- Security, using [RLS](https://learn.graphile.org/docs/PostgreSQL_Row_Level_Security_Infosheet.pdf)
- VSCode integration (optional):
  - Plugin recommendations
  - Preconfigured settings
  - ESLint and Prettier integration (without conflicts)
  - Debugging profiles for node server, worker and frontend

## Prerequisites

You can either work with this project locally (directly on your machine) or
use a pre-configured Docker environment. We'll differentiate this in the README
with a table like this one:

| Local mode                      | OR  | Docker mode                              |
| ------------------------------- | :-: | ---------------------------------------- |
| _command for local development_ | or  | _command for docker-compose development_ |

**Be careful not to mix and match Docker-mode vs local-mode for development.**
You should make a choice and stick to it. (Developing locally but deploying
with `production.Docker` is absolutely fine.)

**IMPORTANT**: If you choose the Docker mode, be sure to read [docker/README.md](docker/README.md).

For users of Visual Studio Code (VSCode), a `.vscode` folder is included with
editor settings and debugger settings provided, plus a list of recommended
extensions. Should you need it, there is also a `.devcontainer` folder which
enables you to use [VSCode's remote
containers](https://code.visualstudio.com/docs/remote/containers) giving you
a local-like development experience whilst still using docker containers.

### Local development

Requirements:

- Node.js v10+ must be installed
- PostgreSQL v10+ server must be available
- VSCode is recommended, but any editor will do

This software has been developed under Mac and Linux, and should work in a
`bash` environment.

**Windows users**: PostGraphile Starter hasn't been fully tested under Windows; PRs to fix Windows compatibility issues are welcome (please keep them small!) Failing that, try the Docker mode :)

### Docker development

Requirements:

- [`docker`](https://docs.docker.com/install/)
- [`docker-compose`](https://docs.docker.com/compose/install/)
- Ensure you've allocated Docker **at least** 4GB of RAM; significantly more recommended
  - (Development only, production is much more efficient)

Has been tested on Windows and Linux (Ubuntu 18.04LTS).

## Getting started

This project is designed to work with `yarn`. If you don't have `yarn`
installed, you can install it with `npm install -g yarn`. The Docker setup
already has `yarn` & `npm` installed and configured.

To get started, please run:

| Local mode   | OR  | Docker mode                     |
| ------------ | :-: | ------------------------------- |
| `yarn setup` | or  | `export UID; yarn docker setup` |

This command will lead you through the necessary steps, and create a `.env`
file for you containing your secrets.

**NOTE:** `export UID` is really important on Linux Docker hosts, otherwise
the files and folders created by Docker will end up owned by root, which is
non-optimal. We recommend adding `export UID` to your `~/.profile` or
`~/.bashrc` or similar so you don't have to remember it.

**Do not commit `.env` to version control!**

## Running

You can bring up the stack with:

| Local mode   | OR  | Docker mode                            |
| ------------ | :-: | -------------------------------------- |
| `yarn start` | or  | `export UID; docker-compose up server` |

After a short period you should be able to load the application at
http://localhost:5678

## Features

**The tech stack:**
- PostgresSQL
- PostGraphile
- GraphQL
- React through Next.js
- TypeScript
- AntD design framework

**Batteries included:**
  - **Prebuilt user system** — supporting both username/password registration and OAuth / social authentication (Twitter, GitHub, Facebook, ...)
    - Register via email with sensible validation and error handling
    - Register via social
    - Verify email flow
    - Handle errors in email verification flow
    - Login (with mixed case username/email, or via social)
    - Email management (add more, delete old, change primary, resend verification)
    - `User.isVerified` to check they have at least on verified email (can use this to govern further permissions)
    - Update profile information
    - Change password flow
    - Forgot password flow
    - Unlinking social profiles
  - **Ant Design Framework** — "A design system with values of Nature and Determinacy for better user experience of enterprise applications"
  - **Preconfigured everything** - get started on developing without having to write boilerplate

- **Development speed:**
  - **Hot reloading** — edit a component and it's re-rendered immediately (warning: state is _not_ restored, because this typically leads to instability); provided by Next.js
  - **SSR with hot reloading** — if you turn JS off and reload the page you should be greeted with the same content anyway; provided by Next.js
  - **TypeScript** — make your project maintainable by starting with strong typing throughout
  - **Linting** — provided by `eslint`, `prettier` and `@typescript-eslint`. Can be extended with extremely powerful lint rules to protect your project from bugs, bad practices, and inconsistencies; configured with sensible but not too intrusive (hopefully) defaults focused on GraphQL development
  - **Autoformatting** ─ Thanks to `prettier` and `eslint`, code can be auto-formatted (and auto-fixed) on save



-
- **React hooks** — modern react code
- **GraphQL** — on the backend through PostGraphile, on the frontend via Apollo client
- **Autogenerated Type-safe GraphQL Hooks** — using `graphql-code-generator` to turn your GraphQL queries and mutations into strongly typed React hooks instantly
- **PostGraphile configured for lean schema** — very tidy GraphQL schema, adhering to PostGraphile best practices
- Save Time:
  -
  - **Debuggability** ─ The server, worker, tests and client are all ready to be debugged using [VSCode's built in breakpoints](https://code.visualstudio.com/docs/editor/debugging)
- Testing:
- **Database tests** — Jest configured to test the database, plus initial tests for various database functions and tables
- **GraphQL tests** — Jest configured to test the GraphQL schema, plus some initial tests
- **Acceptance tests** — implemented with Cypress

- [x] **Job queue** — we've added and configured <a href="https://github.com/graphile/worker">graphile-worker</a> to perform background tasks for you, such as sending emails, and included some example tasks
- [x] **Express server** — with Benjie's [easy to customize and understand middleware system](@app/server/src/index.ts)

- [x]
- [x]
- [x] **Productive roll-forward migrations** — we use <a href="https://github.com/graphile/migrate">graphile-migrate</a> for development speed, but you're welcome to switch to whatever migration library you like
- [x] **Realtime** — PostGraphile is configured with `@graphile/pg-pubsub` to enable Realtime events from the DB; and Apollo is configured to consume them
- [x] **Production build** — command to generate a production build of the project using `yarn run build`
- [x] **Production Docker build** — how to build a Docker image you could use in production
- [x] **Deployment instructions: Heroku** — how to deploy to Heroku

- [x] **Docker development flow** — enables work on this project using Docker (rather than running the Postgres/etc. directly on your machine)
- [x] **Documented error codes** — specification of existing error codes, examples of them being used, and space to add more

- [x] **Sessions** — to persist login information in the traditional way (with cookies)
- [x] **Responsive email templates** — we've added MJML and a templating system to help you format emails; all emails go through the `send_email` worker task so it's easy to customize
- [x] **Email transport** — we've configured Nodemailer to use ethereal.email to catch all development emails, and AWS' SES in production (easy to replace with a different provider thanks to Nodemailer)
- [x]
- [x]
- [x] **HTML→Text emails** — automated conversion from your pretty templates to plain text emails for users that prefer that
- [x] **Form validation** — using AntD's `Form` component

## TODO

Here's some more things we'd like to demonstrate that we've not got around to yet. (If you're interested in helping, reach out on Discord: http://discord.gg/graphile)

- [ ] **File uploads** — user can change their avatar, but this approach can be extended to other areas

## Documentation links

### `yarn start` (or `docker-compose up server`)

This main command runs a number of tasks:

- uses [`graphile-migrate`](https://github.com/graphile/migrate) to watch the`migrations/current.sql` file for changes, and automatically runs it against your database when it changes
- watches the TypeScript source code of the server, and compiles it from `@app/*/src` to `@app/*/dist` so node/`graphile-worker`/etc. can run the compiled code directly
- runs the node server (includes PostGraphile and Next.js middleware)
- runs `graphile-worker` to execute your tasks (e.g. sending emails)
- watches your GraphQL files and your PostGraphile schema for changes and generates your TypeScript React hooks for you automatically, leading to strongly typed code with minimal effort
- runs the `jest` tests in watch mode, automatically re-running as the database or test files change

**NOTE**: `docker-compose up server` also runs the PostgreSQL server that the
system connects to.

You may also choose to develop locally, but use the PostgreSQL server via
`docker-compose up -d db`.

### Cypress e2e tests

Thanks to Cypress.io for sponsoring this work, we've added e2e tests covering
loading the various pages, registering an account, logging in, verifying and
managing your emails. You should be able to easily build on top of these
tests to ensure that your project remains rock-solid at all times.

### Next.js

We use Next.js ([docs](https://nextjs.org/)) to handle the various common
concerns of a React application for us (server-side rendering, routing,
bundling, bundle-splitting, etc). The `@app/client/src/pages/_app.tsx` file is a
[custom &lt;App&gt;](https://nextjs.org/docs#custom-app) which allows you to
add any providers you need to. We've already set it up with `withApollo` from
`@app/client/src/lib/withApollo` which includes all the Apollo configuration,
including the client URL.

### AntD

The component library we're using is AntD ([docs](https://ant.design/)); we've
demonstrated how to use the form validation components on the login/register
pages so you can see how to handle errors from the server.

### Initial database

The database is a jumping-off point; we've already committed the initial user
system for you (but you can `uncommit` this if you need to). You can add
idempotent SQL commands to `migrations/current.sql` and they will run when
you save. When you're happy with your changes, run `yarn db commit`
to commit these commands and reset `migrations/current.sql` to a blank state
ready for the next batch of changes. We deliberately do not include
functionality that we don't think most users will find useful.

### graphile-migrate

To read more about migrations with graphile-migrate, see the
[graphile-migrate docs](https://github.com/graphile/migrate).

### graphile-worker

We've added a few example workers for you, including the `send_email` worker
which performs email templating for you. See `@app/worker/src/tasks` for the
tasks we've created (and to add your own), and see the [graphile-worker
docs](https://github.com/graphile/worker) for more information.

### Server

The server entry point is `@app/server/src/index.ts`; you'll see that it
contains documentation and has split the middleware up into a manageable
fashion. We use traditional cookie sessions, but you can switch this out
for an alternative.

### Login with GitHub

If you set `GITHUB_KEY` and `GITHUB_SECRET` in your `.env` file then you can
also use GitHub's OAuth social authentication; you can add similar logic to the
GitHub logic (in `@app/server/src/middleware/installPassport.ts`) to enable
other social login providers such as Twitter, Facebook, Google, etc. For more
information, see the [passport.js documentation](http://www.passportjs.org/docs/).

## Making it yours

1. Download and extract a zip of [the latest release from GitHub](https://github.com/graphile/starter/releases)
1. In that folder run:
   - `git init`
   - `git add .`
   - `git commit -m "PostGraphile starter base"`
1. Change the project name in `package.json`
1. Change the project settings in `@app/config/src/index.ts`
1. Replace the `README.md` file
1. Commit as you usually would
1. [Show your appreciation with sponsorship](https://www.graphile.org/sponsor/)

## Docker development

Be sure to read [docker/README.md](docker/README.md).

## Building the production docker image

To build the production image, use `docker build` as shown below. You should
supply the `ROOT_URL` build variable (which will be baked into the client
code, so cannot be changed as envvars); if you don't then the defaults will
apply (which likely will not be suitable).

To build the worker, pass `TARGET="worker"` instead of the default
`TARGET="server"`.

```sh
docker build \
  --file production.Dockerfile \
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

Make sure you have customized `@app/config/src/index.ts`.

Make sure everything is committed and pushed in git.

Set up a database server; we recommend using Amazon RDS.

Once your database server is running, you can use our `heroku-setup` script to
automate the setup process. This script does the following:

- Creates the Heroku app
- Adds the redis extension to this Heroku app
- Creates the database in the database server
- Creates the relevant roles, generating random passwords for them
- Installs some common database extensions
- Sets the Heroku config variables
- Adds the Heroku app as a git remote named 'Heroku'
- Pushes the 'master' branch to Heroku to perform your initial build

Copy `heroku-setup.template` to `heroku-setup`, then edit it and customize the
settings at the top. We also recommend reading through the script and
customizing it as you see fit - particularly if you are using additional
extensions that need installing.

Now run the script:

```
bash heroku-setup
```

Hopefully all has gone well. If not, step through the remaining tasks in the
Heroku-setup script and fix each task as you go. We've designed the script so
that if your superuser credentials are wrong, or the Heroku app already exists,
you can just edit the settings and try again. All other errors will probably
need manual intervention. Verbosity is high so you can track exactly what
happened.

The server should be up and running now (be sure to access it over HTTPS
otherwise you will not be able to run GraphQL queries), but it is not yet
capable of sending emails. To achieve this, you must configure an email
transport. We have preconfigured support for Amazon SES. Once SES is set up,
your domain is verified, and you've verified any emails you wish to send email
to (or have had your sending limits removed), make sure that the `fromEmail` in
`@app/config/src/index.ts` is correct, and then create an IAM role for your
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
