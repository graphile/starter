# Production Todolist

The @graphile/starter project this project is based on is designed to be easy
for you to pick up and get going. Therefore, there are certain things in it that
may not be optimal when you are dealing with large amounts of traffic. This file
contains some suggestions about things you might want to improve in order to
make your server more efficient.

## Sessions

By default, sessions are stored into your PostgreSQL database by
`connect-pg-simple`, but this increases the load on your database. To reduce
database load, you should set the `REDIS_URL` environment variable to store
sessions to redis instead. Read more in `installSession.ts`.
