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
