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

We're using the concept of two main database roles: the `DATABASE_OWNER` and the
`DATABASE_VISITOR`. The `DATABASE_VISITOR` is used for all incoming requests and
changes its role according to the requesting client/user to act with the correct
privileges.

The `DATABASE_OWNER` is the internal system user and has access to all resources
in our schemas. The initial migration schema assumes that the `DATABASE_OWNER` is
actually the [user that created the database resources (hence, the owner)](https://www.postgresql.org/docs/current/ddl-priv.html).

You should therefore make sure to create all schema, tables, etc. with the
`DATABASE_OWNER` in all environments (local, dev, prod), not with the default
`postgres` superuser. This ensures that the system behaves as expected when
graduating from your local dev environment to hosted database systems in production.
