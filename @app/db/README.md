# @app/db

We're using PostGraphile in a database-driven fashion in this project; so our
database is paramount. This package includes all the database migrations (one to
start with, but you'll add more to build your project) and tests (using `jest`)
for database functionality.

## graphile-migrate

We're using Graphile Migrate to manage the migrations in this project; but you
may prefer to switch this out for your preferred migration framework such as
[db-migrate](https://db-migrate.readthedocs.io/en/latest/),
[sqitch](https://sqitch.org/), [Knex migrations](http://knexjs.org/#Migrations),
[migra](https://github.com/djrobstep/migra),
[goose](https://github.com/pressly/goose#sql-migrations),
[micrate](https://github.com/amberframework/micrate#usage),
[flyway](https://flywaydb.org/) or many many many others.

Should you decide to stick with Graphile Migrate, we strongly encourage you to
[read the Graphile Migrate README](https://github.com/graphile/migrate/blob/main/README.md)
before attempting to write your own migrations. Graphile Migrate works in quite
a different way to many other migration frameworks, and relys on your discipline
and SQL knowledge to work well.

If you're not very comfortable with SQL then we recommend you use an alternative
migration framework (for now at least, Graphile Migrate is still young...)

## Database Roles

Graphile Starter uses three roles:

- `DATABASE_OWNER` - this is the role that owns the database (**not** the
  database cluster, just the individual database); i.e. it's the role that runs
  all the migrations and owns the resulting schemas, tables and functions.
- `DATABASE_AUTHENTICATOR` - this is the role that PostGraphile connects to the
  database with; it has absolutely minimal permissions (only enough to run the
  introspection queries, and the ability to "switch to" `DATABASE_VISITOR`
  below). When a GraphQL request comes in, we connect to the database as
  `DATABASE_AUTHENTICATOR` and then start a transaction and evaluate the
  equivalent of `SET LOCAL role TO 'DATABASE_VISITOR'`. You might choose to add
  more visitor-like roles (such as an admin role), but the maintainer finds that
  the single role solution tends to be more straightforward and has been
  sufficient for all his needs.
- `DATABASE_VISITOR` - this is the role that the SQL generated from GraphQL
  queries runs as, it's what the vast majority of your `GRANT`s will reference
  and the row level security policies will apply to. It represents both logged
  in AND logged out users to your GraphQL API - it's assumed that your Row Level
  Security policies will deferentiate between these states (and any other
  "application roles" the user may have) to determine what they are permitted to
  do.

The `DATABASE_OWNER` role is also used for certain "elevated privilege"
operations such as login and user registration. Note that `SECURITY DEFINER`
functions adopt the security level of the role that defined the function (as
opposed to `SECURITY INVOKER` which uses the security of the role that is
invoking the function), so you should therefore **make sure to create all
schema, tables, etc. with the `DATABASE_OWNER` in all environments** (local,
dev, production), not with your own user role nor the default superuser role
(often named `postgres`). This ensures that the system behaves as expected when
graduating from your local dev environment to hosted database systems in
production.
