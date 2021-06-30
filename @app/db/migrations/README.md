# Migrations

This folder contains the database migrations. We're using the `graphile-migrate`
project to produce these; we highly recommend you
[read the Graphile Migrate README](https://github.com/graphile/migrate/blob/main/README.md)
before implementing your own migrations.

The main files you'll be working with are those in the `current/` folder.

## afterReset.sql

This file is ran once only, when you reset (or create) your database. It
currently grants permissions to the relevant roles and creates the required
extensions. It's expected that this is ran with database superuser privileges as
normal users often don't have sufficient permissions to install extensions.

## current/\*.sql

This is where your new database changes go. They need to be idempotent (for
explanation
[read the Graphile Migrate README](https://github.com/graphile/migrate/blob/main/README.md)).
The `yarn start` command will automatically watch these files and re-run them
whenever they change, updating your database in realtime. Each file needs a
unique positive integer prefix, we've started you off with
`current/1-current.sql` but you can add more if it helps you structure your
migration more cleanly.

**IMPORTANT**: because we use `ignoreRBAC: false` in PostGraphile's
configuration, new tables _will not show up_ until you `GRANT` permissions on
them.

```sql
create table app_public.my_new_table (
  id serial primary key,
  my_column text
);

-- Doesn't appear until we add:

grant
  select,
  insert (my_column),
  update (my_column),
  delete
on app_public.my_new_table to :DATABASE_VISITOR;
```

## committed/\*.sql

When you're happy with the changes you have made, you can commit your migration
with

```
yarn db commit
```

This will call `graphile-migrate commit` which involves merging the
`current/*.sql` files together and then putting the result into the `committed`
folder with a hash to prevent later modifications (which should instead be done
with additional migrations).

If you've not yet merged your changes (and no-one else has ran them) then you
can run

```
yarn db uncommit
```

and it will perform the reverse of this process so that you may modify the
migrations again.
