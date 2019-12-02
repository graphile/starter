# Contributing

We welcome contributions; but please don't expand the scope of the project
without first discussing it with the maintainers (by opening an issue).

## Migrations

This project will only ever have one migration; we do not need to cater to
backwards compatibility, prefering simplicity for new users.

If you wish to change the database, run

```
yarn db uncommit
```

to move the migration back to `current.sql`; then make your changes, and when
you're happy run:

```
yarn db commit
```

and commit your changes.

## Docker and non-Docker

This project is designed to work both with and without Docker. Please don't
break this!
