// These are the connection strings for the DB and the test DB.
// NOTE: in production you probably want to add ?ssl=1 to force SSL usage.
// NOTE: 'psql' does not like ?ssl=1, use ?sslmode=require for psql.
// NOTE: these used to be in `.env` but now it is used by docker-compose we can't use expansions
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  `postgres://${process.env.DATABASE_OWNER}:${process.env.DATABASE_OWNER_PASSWORD}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}`;
process.env.AUTH_DATABASE_URL =
  process.env.AUTH_DATABASE_URL ||
  `postgres://${process.env.DATABASE_AUTHENTICATOR}:${process.env.DATABASE_AUTHENTICATOR_PASSWORD}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}`;
process.env.SHADOW_DATABASE_URL =
  process.env.SHADOW_DATABASE_URL ||
  `postgres://${process.env.DATABASE_OWNER}:${process.env.DATABASE_OWNER_PASSWORD}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}_shadow`;
process.env.SHADOW_AUTH_DATABASE_URL =
  process.env.SHADOW_AUTH_DATABASE_URL ||
  `postgres://${process.env.DATABASE_AUTHENTICATOR}:${process.env.DATABASE_AUTHENTICATOR_PASSWORD}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}_shadow`;

// Always overwrite test database URL
process.env.TEST_DATABASE_URL = `postgres://${process.env.DATABASE_OWNER}:${process.env.DATABASE_OWNER_PASSWORD}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}_test`;

// https://docs.cypress.io/guides/guides/environment-variables.html#Option-3-CYPRESS
process.env.CYPRESS_ROOT_URL = process.env.ROOT_URL;
