# PostGraphile Starter

## Purpose

Take this software and use it as the starting point to build your project. Go
make some money, and [give something
back](https://github.com/sponsors/benjie) to support us building
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
<td align="center"><a href="https://timescale.com/"><img src="https://www.graphile.org/images/sponsors/timescale.svg" width="90" height="90" alt="Timescale" /><br />Timescale</a></td>
<td align="center"><a href="http://p72.vc/"><img src="https://www.graphile.org/images/sponsors/p72.png" width="90" height="90" alt="Point72 Ventures" /><br />Point72 Ventures</a></td>
</tr></table>

<!-- SPONSORS_END -->

## Goals

- Easy to start
- Batteries included
  - User registration, login, forgot password, email management, settings, etc.
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
  - optional Redis session store

## Prerequisites

You can either work with this project locally (directly on your machine) or
use a pre-configured Docker enviroment.

**Be careful not to mix and match Docker-mode vs local-mode for development.**
You should make a choice and stick to it. (Developing locally but deploying
with `production.Docker` is absolutely fine.)

For users of Visual Studio Code (VSCode), a `.vscode` folder is included with
editor settings and debugger settings provided, plus a list of recommended
extensions. There is also a `.devcontainer` folder, which eases developing
with these docker containers.

### Local development

Requires:

- Node.js v10+ must be installed
- PostgreSQL v10+ server must be available
- VSCode is recommended, but any editor will do

This software has been developed under Mac and Linux, and should work in a
`bash` environment. I'm not sure if it works under Windows; PRs to fix
Windows compatibility issues would be welcome (please keep them small!).
Failing that, try the Docker mode :)

### Docker development

Requires:

- [`docker`](https://docs.docker.com/install/)
- [`docker-compose`](https://docs.docker.com/compose/install/)

Has been tested on Windows and Linux.

## Getting started

### If you want to work with `docker-compose`

**ONLY** do this if you want to use the Docker development flow.

You can run this command in root (you do not need to install dependencies):

```
yarn docker setup
```

Alternatively you can run these steps manually:

- Start PostgreSQL servers: `docker-compose up -d db`
- Run one time setup in "webapp": `docker-compose run webapp bash`
- Follow: [Initial Setup](#initial_setup) inside this new shell

### Initial Setup

**Same for local and Docker variants.**

This project is designed to work with `yarn`. If you don't have `yarn`
installed, you can install it with `npm install -g yarn`. The Docker setup
already has `yarn` & `npm` installed and configured.

To get started, please run the `yarn setup` command which should lead you
through the necessary steps:

```
yarn setup
```

The above command will create a `.env` file for you containing your secrets.
Do not commit it to version control!

## Running

You can bring up the stack with:

### Locally:

```
yarn start
```

### Docker:

```
export UID; docker-compose up webapp
```

**NOTE:** `export UID` is really important on Linux hosts, otherwise the files
and folders created will end up owned by root, which is non-optimal. We
recommend adding `export UID` to your `~/.profile` or `~/.bashrc` or similar.

Running this command executes `yarn start` inside the `webapp` container.

After a short period you should be able to load the application at
http://localhost:5678

**NOTE**: if you run `docker-compose run webapp` (rather than `docker-compose up webapp`) the ports won't be exposed, so you cannot view your server.

## Features

Checked features have been implemented, unchecked features are goals for the future.

- [x] **TypeScript** — make your project maintainable by starting with strong typing throughout
- [x] **React hooks** — modern react code
- [x] **GraphQL** — on the backend through PostGraphile, on the frontend via Apollo client
- [x] **Autogenerated Type-safe GraphQL Hooks** — using `graphql-code-generator` to turn your GraphQL queries and mutations into strongly typed React hooks instantly
- [x] **PostGraphile configured for lean schema** — very tidy GraphQL schema, adhering to PostGraphile best practices
- [x] **Autoformatting** ─ Thanks to `prettier` and `eslint`, code can be auto-formatted (and auto-fixed) on save
- [x] **Job queue** — we've added and configured <a href="https://github.com/graphile/worker">graphile-worker</a> to perform background tasks for you, such as sending emails, and included some example tasks
- [x] **Express server** — with Benjie's [easy to customize and understand middleware system](@app/server/src/index.ts)
- [x] **Debuggability** ─ The server, worker, tests and client are all ready to be debugged using [VSCode's built in breakpoints](https://code.visualstudio.com/docs/editor/debugging)
- [x] **Hot reloading** — edit a component and it's re-rendered immediately (warning: state is _not_ restored, because this typically leads to instability); provided by Next.js
- [x] **SSR with hot reloading** — if you turn JS off and reload the page you should be greeted with the same content anyway; provided by Next.js
- [x] **Productive roll-forward migrations** — we use <a href="https://github.com/graphile/migrate">graphile-migrate</a> for development speed, but you're welcome to switch to whatever migration library you like
- [x] **Realtime** — PostGraphile is configured with `@graphile/pg-pubsub` to enable Realtime events from the DB; and Apollo is configured to consume them
- [x] **Production build** — command to generate a production build of the project using `yarn run build`
- [x] **Production Docker build** — how to build a Docker image you could use in production
- [x] **Deployment instructions: Heroku** — how to deploy to Heroku
- [x] **Database tests** — Jest configured to test the database, plus initial tests for various database functions and tables
- [x] **GraphQL tests** — Jest configured to test the GraphQL schema, plus some initial tests
- [x] **Acceptance tests** — implemented with Cypress
- [x] **Docker development flow** — enables work on this project using Docker (rather than running the Postgres/etc. directly on your machine)
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
- [x] **Responsive email templates** — we've added MJML and a templating system to help you format emails; all emails go through the `send_email` worker task so it's easy to customize
- [x] **Email transport** — we've configured Nodemailer to use ethereal.email to catch all development emails, and AWS' SES in production (easy to replace with a different provider thanks to Nodemailer)
- [x] **Ant Design** — "A design system with values of Nature and Determinacy for better user experience of enterprise applications"
- [x] **Linting** — provided by `eslint`, `prettier` and `@typescript-eslint`. Can be extended with extremely powerful lint rules to protect your project from bugs, bad practices, and inconsistencies; configured with sensible but not too intrusive (hopefully) defaults focused on GraphQL development
- [x] **HTML→Text emails** — automated conversion from your pretty templates to plain text emails for users that prefer that
- [x] **Form validation** — using AntD's `Form` component

## TODO

Here's some more things we'd like to demonstrate that we've not got around to yet. (If you're interested in helping, reach out on Discord: http://discord.gg/graphile)

- [ ] **File uploads** — user can change their avatar, but this approach can be extended to other areas

## Documentation links

### `yarn start` (or `docker-compose up webapp`)

This main command runs a number of tasks:

- uses [`graphile-migrate`](https://github.com/graphile/migrate) to watch the`migrations/current.sql` file for changes, and automatically runs it against your database when it changes
- watches the TypeScript source code of the server, and compiles it from `@app/*/src` to `@app/*/dist` so node/`graphile-worker`/etc. can run the compiled code directly
- runs the node server (includes PostGraphile and Next.js middleware)
- runs `graphile-worker` to execute your tasks (e.g. sending emails)
- watches your GraphQL files and your PostGraphile schema for changes and generates your TypeScript React hooks for you automatically, leading to strongly typed code with minimal effort
- runs the `jest` tests in watch mode, automatically re-running as the database or test files change

**NOTE**: `docker-compose up webapp` also runs the PostgreSQL server that the
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
[custom lt;App&gt;](https://nextjs.org/docs#custom-app) which allows you to
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

## Docker development notes

If you don't `export UID` then Docker on Linux may create the files and
folders as root. We strongly advise you `export UID`.

PostgreSQL logs from Docker on stdout can be overwhelming, so we recommend to
only start the `db` services in detached mode: `docker-compose up -d db`.

To see logs on your `stdout` you can use: `docker-compose logs db` anytime.

We've enabled `log_truncate_on_rotation` but you may need to prune these
periodically. See [log file
maintenance](https://www.postgresql.org/docs/current/logfile-maintenance.html).

Our Docker setup seems to trigger more watch events than the local one, so
it seems to do more redundant work/produce more output. A PR to fix this
would be welcome!

## Using and developing with included `docker-compose` setup

This feature was the result of a herculean effort from @JoeSchr.

### Explanation:

The docker environment (`docker-compose.yml`) is set up so you can almost work with this repo like you would directly.

There is a `webapp` docker-compose service which has `node` and `yarn` already installed. Once you have everything setup
you can simply start it via `docker-compose up`,
or use the the alias `yarn docker start`, which does some more useful stuff as well. The `yarn docker` commands are provided by `docker/package.json`.

You also could start the service in detached mode, then attach into the running service to work from inside the container like you would locally. If you want, you can do this with the `dev` service instead of the `webapp` service. The `dev` service provides a few more developer tools (like `git`, `tmux`, ...) which are helpful for developing, but it is not appropriate for production usage and may make it harder to reproduce issues.

**NOTE (for Windows)**: For _hot-reloading_ to work, you may need to install and run [docker-volume-watcher](https://github.com/merofeev/docker-windows-volume-watcher)

#### Use Case Example:

> Attach to `dev`, run `yarn db commit` to commit the latest migration, then keep on developing on your React client with hot reloading:

```sh
# make sure everything is ready to start and no ports are blocked
$ docker-compose down
# start dev (and linked db) service in detached mode (so we can continue typing)
$ docker-compose up -d dev
# attach to dev container shell
$ docker-compose exec dev bash
# commit migration from inside container
@dev $ yarn db commit
# develop on client with hot reloading
@dev $ yarn start
# when it prompts you to do so, open `http://localhost:5678` in your browser
```

> Compact alias for above:

```sh
# make sure everything is ready to start and no ports are blocked
# start dev (and linked db) service in detached mode (so we can continue typing)
# attach to dev container shell
$ yarn docker dev
# commit migration from inside container
@dev $ yarn db commit
# develop on client with hot reloading
@dev $ yarn start
# when it prompts you to do so, open `http://localhost:5678` in your browser
```

### About `dev` docker-compose service

There is another "secret" service, `dev`, inside `docker-compose.yml` which
extends `webapp`, our normal `node.js` server service container.

This decision was made to separate the docker services, one for minimal setup and for comfortable development.

The `webapp` service is for starting the Node.js server with React and Next.js, and will keep running until `yarn start` stops or crashes.
This is similar to a production deployment environment except hot reload, environment variables, and similar things are tuned for active development (and are not production ready).
See:
[Building the production docker image](#building_the_production_docker_image),
on how to optimize your `Dockerfile` for production.

The `dev` service is for attaching to a Docker container's `bash` shell and developing
actively from inside. It has several developer tools and configs (for example git, vim,
...) already installed.

**Aliases** for quickly using `dev` container (without VSCode):

#### Attach to shell, inside `dev` container:

```
yarn docker dev
```

#### Run `yarn start` inside `dev` container:

```
yarn docker dev:start
```

See `docker/package.json` to learn about more aliases.

### About VSCode with Remote Container Extension

A `.devcontainer` folder is also provided, which enables the `Visual Studio Code Remote - Containers` extension (install with ctrl+p, then `ext install ms-vscode-remote.vscode-remote-extensionpack`) to develop from inside the container.

> The Visual Studio Code Remote - Containers extension lets you use a Docker container as a full-featured development environment. It allows you to open any folder inside (or mounted into) a container and take advantage of Visual Studio Code's full feature set. A `devcontainer.json` file in your project tells VS Code how to access (or create) a development container with a well-defined tool and runtime stack. This container can be used to run an application or to sandbox tools, libraries, or runtimes needed for working with a codebase.

> Workspace files are mounted from the local file system or copied or cloned into the container. Extensions are installed and run inside the container, where they have full access to the tools, platform, and file system. This means that you can seamlessly switch your entire development environment just by connecting to a different container.

> This lets VS Code provide a local-quality development experience — including full IntelliSense (completions), code navigation, and debugging — regardless of where your tools (or code) are located.

See [Developing inside a Container](https://code.visualstudio.com/docs/remote/containers) for more.

Once one-time setup is complete, you can open this container in VSCode whenever you like.

This feels like developing locally, whilst having the advantages of a pre-configured Docker environment.

#### If you want to use your local configs e.g. `gitconfig` your `ssh` creds.

Uncomment `postCreateCommand` in `devcontainer.json` and the appropriate volume mounts
at service `dev` in `docker-compose.yml`

**BE AWARE:** on Windows your whole `$HOME` folder will be copied over, including all your `ssh` creds.

### Using VSCode with Remote Container Extension

#### One time only

If you cloned the starter to a folder called something other than `starter` you need to fix the reference in `.devcontainer/dev.Dockerfile`. It has a line like this:

```docker
FROM starter_webapp:latest
```

Replace `starter` in this line with your projects folder name, for example if your cloned the starter to a folder named `my_project` then that line should now be:

```docker
FROM my_project_webapp:latest
```

### Open project in VSCode and start developing

- Install vscode-extension: [ms-vscode-remote.remote-container](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
- Press `Ctrl+Shift+P`
- Type `>Remote-Containers: Reopen in Container`
- Develop as if you were developing locally
- e.g. Use VSCode File Explorer
- e.g. Run extensions only inside this environment
- e.g. Use bash inside container directly: `yarn start`
  - Try: `Ctrl+Shift+~`, if shell panel is hidden

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
