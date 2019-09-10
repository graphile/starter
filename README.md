# PostGraphile Starter

You should replace this README with your own.

## Scope

The intention of this software is that you will take the ideas and concepts
in it and incorporate them into their own project, or use a copy of this
software as a starting point for your project. Please note that this software
is not "complete," free of software defects, or free of security issues — it
is not a finished solution, but rather the seed of a solution which you
should review, customise, fix, and develop further.

It is intended that you use a "point in time" version of this software ─ it
is not intended that you can merge updates to this software into your own
derivative in an automated fashion.

## Prerequisites

- Node.js v10+ must be installed
- Either a PostgreSQL v10+ server must be available, or Docker and docker-compose must be available

This software has been developed under Mac and Linux, and should work in a
`bash` environment. I'm not sure if it works under Windows; PRs to fix
Windows compatibility issues would be welcome (please keep them small!).

## Getting started

We will be using `yarn`. If you don't have `yarn` installed, you can install
it with `npm install -g yarn`.

To get started we need to install the dependencies, do some initial code
building, and configure a database to use with the project. The `yarn setup`
command will ask a few questions and take care of this for us.

```
yarn setup
```

The above command will create a `.env` file for you containing all your
secrets. Do not commit it!

## Running

Finally you can bring the stack up:

- natively: `yarn dev`
- with Docker: `docker-compose up`

After a short period you should then be able to load the application at
http://localhost:5678

**Be careful not to mix and match Docker-mode vs local-mode.** You should
stick with the answer you gave during setup.

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
- [x] **Deployment instructions: Heroku** — how to deploy to Heroku
- [x] **Database tests** — Jest configured to test the database, plus tests for some functions and tables (PRs welcome!)

## TODO

Here's some more things we'd like to demonstrate that we've not got around to yet. (If you're interested in helping, reach out on Discord: http://discord.gg/graphile)

- [ ] **Docker development flow** — how to work on this project using Docker (rather than running the code/servers directly)
- [ ] **Testing GraphQL** — Jest configured to test the GraphQL API
- [ ] **Acceptance testing** — one of Selenium, Cypress, TestCafe, etc
- [ ] **File uploads** — user can change their avatar, but this approach can be extended to other areas
- [ ] **Deployment instructions: Docker** — how to deploy with Docker

## Documentation links

The `yarn dev` command runs a number of tasks:

- `db`: uses [`graphile-migrate`](https://github.com/graphile/migrate) to watch the `migrations/current.sql` file for changes, and automatically runs it against your database when it changes
- `server:src`: watches the TypeScript source code of the server, and compiles it from `backend/src` to `backend/dist` so node and `graphile-worker` can run the compiled code directly
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
which performs email templating for you. See `backend/src/worker/tasks` for the
tasks we've created (and to add your own), and see the [graphile-worker
docs](https://github.com/graphile/worker) for more information.

The server entry point is `backend/src/server/index.ts`; you'll see that it
contains documentation and has split the middleware up into a manageable
fashion. We use traditional cookie sessions, but you can switch this out
for an alternative.

If you set `GITHUB_KEY` and `GITHUB_SECRET` in your `.env` file then you can
also use GitHub's OAuth social authentication; you can add similar logic to the
GitHub logic (in `backend/src/server/middleware/installPassport.ts`) to enable
other social login providers such as Twitter, Facebook, Google, etc. For more
information, see the [passport.js
documentation](http://www.passportjs.org/docs/).

## Deploying to Heroku

If you are using `graphile-migrate` make sure that you have executed
`graphile-migrate commit` to commit the migration, since we only run committed
migrations in production.

Make sure you have customised `backend/src/config.ts`.

Make sure everything is committed and pushed.

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
heroku apps:delete \$APP_NAME
```

To delete the database/roles (replace `dbname` with your database name):

```
drop database dbname;
drop role dbname_visitor;
drop role dbname_authenticator;
drop role dbname;
```

## AGPLv3 License

This is open source software; you may use, modify and distribute it under the
terms of the GNU Affero General Public License Version 3 (AGPLv3, see below).
One of the requirements of this license is that if you change the software
(e.g. to add your own features or make it your own) your modified version must
prominently offer all users interacting with it (including remotely through a
computer network) an opportunity to receive the source code of your version —
read below for full details.

If you do not wish your use of the software to be governed by the AGPLv3, an
alternative commercial license is available for purchase from Graphile Ltd.
Buying such a license is mandatory as soon as you modify then project and allow
someone to use it without also disclosing your source code to them.

This software references other software (including, but not limited to, that
referenced in `package.json` and `yarn.lock`) which has its own licenses — it
is your responsibility to review the licenses of the referenced software and
ensure you are happy with their terms.
