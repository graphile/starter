# Graphile Starter

## Take it for a spin!

We're running the starter at:

https://graphile-starter.herokuapp.com

Feel free to register an account and have a poke around as you see fit.

**NOTE**: emails are sent from Graphile Starter, so please only enter email
addresses you control.

**NOTE**: every time we merge to master, we ship a new version of Graphile
Starter to Heroku and entirely wipe the database, so your data may not persist.
If you wish to delete your data before this time you can do so via the delete
account feature baked into the starter.

## NOT FOR BEGINNERS

We do not advise that you build your own projects on top of this project until
you're comfortable with the various tools it uses
([Node.js](https://nodejs.org/en/docs/),
[Express](https://expressjs.com/en/api.html),
[PostgreSQL](https://www.postgresql.org/docs/current/index.html),
[GraphQL](https://graphql.org/learn/),
[PostGraphile](https://www.graphile.org/postgraphile/introduction/),
[Graphile Worker](https://github.com/graphile/worker),
[Graphile Migrate](https://github.com/graphile/migrate),
[TypeScript](https://www.typescriptlang.org/docs/),
[React](https://reactjs.org/docs/getting-started.html),
[Apollo Client for React](https://www.apollographql.com/docs/react/),
[GraphQL Code Generator](https://github.com/dotansimha/graphql-code-generator),
[ESLint](https://eslint.org/),
[Prettier](https://prettier.io/docs/en/index.html), [Jest](https://jestjs.io/),
[Cypress](https://www.cypress.io/), etc).

This is an **advanced** project with deeply integrated tooling across the full
stack. The project is called "Starter" because it helps you to start new
projects with all these technologies, tools and techniques already in place. If
you're not already familiar with these things then you'll probably find the
project overwhelming, it is not intended to be your first experience of any of
these tools.

If you're just getting started with PostGraphile, before you dive into this
project make sure you check out the
[PostGraphile required knowledge](https://www.graphile.org/postgraphile/required-knowledge/)
and especially the
[schema design tutorial](https://www.graphile.org/postgraphile/postgresql-schema-design/).
This repository takes a slightly different approach to schema design than the
aforementioned tutorial, but it's still an incredibly valuable resource.

## Purpose

Graphile Starter is an opinionated quick-start project for full-stack
application development in React, Node.js, GraphQL and PostgreSQL. It includes
the foundations of a modern web application, with a full user registration
system, organizations (e.g. teams/companies/etc), session management, optimized
job queue, a significant amount of pre-configured tooling, tests (both
end-to-end and more granular) and much more.

It is suitable for building projects both large and small, with a focus on
productivity. You might use it:

- to go from conception to launch of a web app during a hack day
- as the foundation for client projects at your web agency
- to build your side-hustle without spending lots of time on boilerplate
- to build a SaaS project to help fund your open source work 😉

However you use it, the project can be deployed to many platforms, and can be
scaled to larger audiences both horizontally and vertically with very few
changes.

Please note that this software is not "complete," free of software defects, or
free of security issues — it is not a "finished" solution, but rather the seed
of a solution which you should review, customize, fix, and develop further.

It is intended that you use a "point in time" version of this software ─ it is
not intended that you can merge updates to this software into your own
derivative in an automated fashion.

<!-- SPONSORS_BEGIN -->

## Crowd-funded open-source software

**PLEASE DONATE.**

Take this software and use it as the starting point to build your project. Go
make some money, and [give something back](https://graphile.org/sponsor/) to
support us building more tools and kits for the Node, GraphQL and PostgreSQL
ecosystems. We have made this project available under the simple and liberal MIT
license to give you to a huge amount of freedom in how you use it, but this
isn't possible without the help of our wonderful sponsors.

We need more people to join our sponsors so we can continue to bring about
awesome projects like this. We'd love to spend more time on open source,
building tools that will save you and others even more time and money ─ please
sponsor our open source efforts:

### [Click here to find out more about sponsors and sponsorship.](https://www.graphile.org/sponsor/)

And please give some love to our featured sponsors 🤩:

<table><tr>
<td align="center"><a href="https://surge.io/"><img src="https://graphile.org/images/sponsors/surge.png" width="90" height="90" alt="Surge" /><br />Surge</a> *</td>
<td align="center"><a href="https://storyscript.com/?utm_source=postgraphile"><img src="https://graphile.org/images/sponsors/storyscript.png" width="90" height="90" alt="Story.ai" /><br />Story.ai</a> *</td>
<td align="center"><a href="http://chads.website"><img src="https://graphile.org/images/sponsors/chadf.png" width="90" height="90" alt="Chad Furman" /><br />Chad Furman</a> *</td>
<td align="center"><a href="https://www.the-guild.dev/"><img src="https://graphile.org/images/sponsors/theguild.png" width="90" height="90" alt="The Guild" /><br />The Guild</a> *</td>
</tr><tr>
<td align="center"><a href="https://www.fanatics.com/"><img src="https://graphile.org/images/sponsors/fanatics.png" width="90" height="90" alt="Fanatics" /><br />Fanatics</a> *</td>
<td align="center"><a href="https://dovetailapp.com/"><img src="https://graphile.org/images/sponsors/dovetail.png" width="90" height="90" alt="Dovetail" /><br />Dovetail</a> *</td>
<td align="center"><a href="https://www.enzuzo.com/"><img src="https://graphile.org/images/sponsors/enzuzo.png" width="90" height="90" alt="Enzuzo" /><br />Enzuzo</a> *</td>
</tr></table>

<em>\* Sponsors the entire Graphile suite</em>

<!-- SPONSORS_END -->

## Table of contents

- [Graphile Starter](#graphile-starter)
  - [Take it for a spin!](#take-it-for-a-spin)
  - [NOT FOR BEGINNERS](#not-for-beginners)
  - [Purpose](#purpose)
  - [Crowd-funded open-source software](#crowd-funded-open-source-software)
    - [Click here to find out more about sponsors and sponsorship.](#click-here-to-find-out-more-about-sponsors-and-sponsorship)
  - [Table of contents](#table-of-contents)
  - [Features](#features)
  - [Variants](#variants)
  - [Prerequisites](#prerequisites)
    - [Local development](#local-development)
    - [Docker development](#docker-development)
  - [Getting started](#getting-started)
  - [Running](#running)
  - [Making it yours](#making-it-yours)
  - [Docker development](#docker-development-1)
  - [Building the production docker image](#building-the-production-docker-image)
  - [Production build for local mode](#production-build-for-local-mode)
  - [Deploying to Heroku](#deploying-to-heroku)
  - [Cleanup](#cleanup)
  - [Custom packages](#custom-packages)
  - [MIT License](#mit-license)

## Features

Graphile Starter is a full-stack [GraphQL](https://graphql.org/learn/) and
[React](https://reactjs.org/) project, with server-side rendering (SSR) and
routing thanks to [Next.js](https://nextjs.org/). The backend is a beautiful
pairing of Node.js and PostgreSQL running on Express.js, enabled by
[PostGraphile](https://www.graphile.org/postgraphile/) in library mode. The
frontend uses the [AntD](https://ant.design/) design framework to accelerate
development. The entire stack is written in TypeScript, with auto-generated
GraphQL types and operations thanks to
[graphql-code-generator](https://github.com/dotansimha/graphql-code-generator).

There are four tenets to Graphile Starter:

- Speedy development
- Batteries included
- Type safety
- Best practices

Graphile Starter is easy to start and everything is pre-configured as much as
possible.

**Speedy development**: hot reloading, easy debugging, Graphile's
[idempotent migration system](https://github.com/graphile/migrate),
[job queue](/TECHNICAL_DECISIONS.md#job-queue) and server middleware ready to
use; not to mention deep integration with VSCode should you use that editor:
plugin recommendations, pre-configured settings, ESLint and Prettier integration
and debugging profiles

**Batteries included**: full user system and OAuth, AntD design framework, Jest
and [Cypress end-to-end](/TECHNICAL_DECISIONS.md#cypress-e2e-tests) testing,
security, email templating and transport, pre-configured linting and code
formatting, deployment instructions, and more

**Type safety**: pre-configured type checking, strongly typed throughout with
TypeScript

**Best practices**: React, GraphQL, PostGraphile, Node, Jest and Cypress best
practices

See [TECHNICAL_DECISIONS.md](TECHNICAL_DECISIONS.md) for a more detailed list of
features included and the technical decisions behind them.

## Variants

Since this is a highly opinionated starter; community members may have slightly
different opinions and may choose to maintain forks of this project that apply
their own opinions. A few of these are listed below; if you maintain a fork of
this project please make a note at the top of your own README, and add it to
this list:

- [Vue 3 + Vite SSR variant](https://github.com/xvaara/graphile-starter-vite-ssr-vue3-apollo) -
  replaces Next.js with Vue and Vite SSR
- [Nuxt.js variant](https://github.com/JoeSchr/graphile-starter) - replaces
  Next.js for Vue users
- [Create React App variant](https://github.com/alexk111/graphile-starter-cra) -
  replaces Next.js for apps without Server Side Rendering

**VARIANTS ARE NOT OFFICIALLY SUPPORTED** and may become out of date or
unmaintained over time. If you have issues with variants, please submit issues
or PRs to the projects in question, not to this project.

## Prerequisites

You can either work with this project locally (directly on your machine) or use
a pre-configured Docker environment. We'll differentiate this in the README with
a table like this one:

| Local mode                      | OR  | Docker mode                              |
| ------------------------------- | :-: | ---------------------------------------- |
| _command for local development_ | or  | _command for docker-compose development_ |

**Be careful not to mix and match Docker-mode vs local-mode for development.**
You should make a choice and stick to it. (Developing locally but deploying with
`production.Docker` is absolutely fine.)

**IMPORTANT**: If you choose the Docker mode, be sure to read
[docker/README.md](docker/README.md).

For users of Visual Studio Code (VSCode), a `.vscode` folder is included with
editor settings and debugger settings provided, plus a list of recommended
extensions. Should you need it, there is also a `.devcontainer` folder which
enables you to use
[VSCode's remote containers](https://code.visualstudio.com/docs/remote/containers)
giving you a local-like development experience whilst still using docker
containers.

### Local development

Requires:

- Node.js v14+ must be installed
- PostgreSQL v10+ server must be available
- `pg_dump` command must be available (or you can remove this functionality)
- VSCode is recommended, but any editor will do

This software has been developed under Mac and Linux, and should work in a
`bash` environment.

**Windows users**: making a project like Graphile Starter run smoothly on
Windows can be a challenge; `@JoeSchr` and `@hips` on the
[Graphile Discord](http://discord.gg/graphile) have been working in improving
this and they're pretty pleased with the result, but you may still get some
teething problems. PRs to fix Windows compatibility issues are welcome (please
keep them small!) Failing that, try the Docker mode :)

### Docker development

Requires:

- [`docker`](https://docs.docker.com/install/)
- [`docker-compose`](https://docs.docker.com/compose/install/)
- Ensure you've allocated Docker **at least** 4GB of RAM; significantly more
  recommended
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

This command will lead you through the necessary steps, and create a `.env` file
for you containing your secrets.

**NOTE:** `export UID` is really important on Linux Docker hosts, otherwise the
files and folders created by Docker will end up owned by root, which is
non-optimal. We recommend adding `export UID` to your `~/.profile` or
`~/.bashrc` or similar so you don't have to remember it.

**Do not commit `.env` to version control!**

## Running

You can bring up the stack with:

| Local mode   | OR  | Docker mode                     |
| ------------ | :-: | ------------------------------- |
| `yarn start` | or  | `export UID; yarn docker start` |

After a short period you should be able to load the application at
http://localhost:5678

This main command runs a number of tasks:

- uses [`graphile-migrate`](https://github.com/graphile/migrate) to watch
  the`migrations/current.sql` file for changes, and automatically runs it
  against your database when it changes
- watches the TypeScript source code of the server, and compiles it from
  `@app/*/src` to `@app/*/dist` so node/`graphile-worker`/etc. can run the
  compiled code directly
- runs the node server (includes PostGraphile and Next.js middleware)
- runs `graphile-worker` to execute your tasks (e.g. sending emails)
- watches your GraphQL files and your PostGraphile schema for changes and
  generates your TypeScript React hooks for you automatically, leading to
  strongly typed code with minimal effort
- runs the `jest` tests in watch mode, automatically re-running as the database
  or test files change

**NOTE**: `docker-compose up server` also runs the PostgreSQL server that the
system connects to.

You may also choose to develop locally, but use the PostgreSQL server via
`docker-compose up -d db`.

Then for development you may need a console; you can open one with:

| Local mode | OR  | Docker mode                    |
| ---------- | :-: | ------------------------------ |
| `bash`     | or  | `export UID; yarn docker bash` |

To shut everything down:

| Local mode | OR  | Docker mode                    |
| ---------- | :-: | ------------------------------ |
| Ctrl-c     | or  | `export UID; yarn docker down` |

## Making it yours

1. Download and extract a zip of
   [the latest release from GitHub](https://github.com/graphile/starter/releases)
1. In that folder run:
   - `git init`
   - `git add .`
   - `git commit -m "Graphile Starter base"`
1. Change the project name in `package.json`
1. Change the project settings in `@app/config/src/index.ts`
1. Replace the `README.md` file
1. Add your own copyright notices to the `LICENSE.md` file
1. Commit as you usually would
1. [Show your appreciation with sponsorship](https://www.graphile.org/sponsor/)

## Docker development

Be sure to read [docker/README.md](docker/README.md).

## Building the production docker image

To build the production image, use `docker build` as shown below. You should
supply the `ROOT_URL` build variable (which will be baked into the client code,
so cannot be changed as envvars); if you don't then the defaults will apply
(which likely will not be suitable).

To build the worker, pass `TARGET="worker"` instead of the default
`TARGET="server"`.

```sh
docker build \
  --file production.Dockerfile \
  --build-arg ROOT_URL="http://localhost:5678" \
  --build-arg TARGET="server" \
  .
```

When you run the image you must pass it the relevant environmental variables,
for example:

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

Note: If you are using the `production.Dockerfile` to run graphile/starter in a
Docker container on eg. Kubernetes, AWS ECS, DigitalOcean App Platform (or
similar) and you are trying to connect to Amazon RDS or DigitalOcean databases
(or probably other managed databases), make sure to replace
`/data/amazon-rds-ca-cert.pem` with the CA certificate of your own database.
This file is copied into your Docker image during build time and can therefore
be referenced in your env variables `DATABASE_URL` and `AUTH_DATABASE_URL`:  
`DATABASE_URL="postgres://name:password@host:port/dbname?ssl=true&sslrootcert=/app/data/amazon-rds-ca-cert.pem"`

## Production build for local mode

Use `yarn run build` to generate a production build of the project

## Deploying to Heroku

Prerequisites:

- Install the Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli

If you are using `graphile-migrate` make sure that you have executed
`graphile-migrate commit` to commit all your database changes, since we only run
committed migrations in production.

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

Create a copy of `heroku-setup.template` and rename the copy to `heroku-setup`,
then edit it and customize the settings at the top. We also recommend reading
through the script and customizing it as you see fit - particularly if you are
using additional extensions that need installing.

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
transport. We have pre-configured support for Amazon SES. Once SES is set up,
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

Generate an Access Key for this IAM role, and then tell Heroku the access key id
and secret:

```
heroku config:set AWS_ACCESS_KEY_ID="..." AWS_SECRET_ACCESS_KEY="..." -a $APP_NAME
```

Now you can tell Heroku to run the worker process as well as the currently
running 'web' process:

```
heroku ps:scale worker=1 -a $APP_NAME
```

When you register an account on the server you should receive a verification
email containing a clickable link. When you click the link your email will be
verified and thanks to GraphQL subscriptions the previous tab should be updated
to reflect that your account is now verified.

You can also configure your application for social login. This works the same as
in development except the callback URL will be different, something like
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

## Custom packages

When running `yarn setup`, this command will also invoke `lerna run setup`. This
allows you to add custom setup hooks necessary for your individual packages.

Add a line like the following to your `scripts` section in your `package.json`:

`"setup": "npm i -g some-package"`

## MIT License

This is open source software; you may use, modify and distribute it under the
terms of the MIT License, see
[GRAPHILE_STARTER_LICENSE.md](./GRAPHILE_STARTER_LICENSE.md).
