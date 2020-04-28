// These are the connection strings for the DB and the test DB.
// NOTE: in production you probably want to add ?ssl=true to force SSL usage.
// NOTE: these used to be in `.env` but now it is used by docker-compose we can't use expansions
const { resolve } = require("path");

function fixFilePaths(connectionString) {
  // Connection string may contain '../../data/amazon-rds-ca-cert.pem' or
  // similar; but we might be running it from somewhere other than `@app/*/`
  // (e.g. maybe `@app/*/dist/`). To solve this, we make the file path concrete
  // here.
  return connectionString.replace(
    /\.\.\/\.\.\/data\//g,
    resolve(__dirname, "../../data") + "/"
  );
}

process.env.DATABASE_URL = process.env.DATABASE_URL
  ? fixFilePaths(process.env.DATABASE_URL)
  : `postgres://${process.env.DATABASE_OWNER}:${process.env.DATABASE_OWNER_PASSWORD}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}`;
process.env.AUTH_DATABASE_URL = process.env.AUTH_DATABASE_URL
  ? fixFilePaths(process.env.AUTH_DATABASE_URL)
  : `postgres://${process.env.DATABASE_AUTHENTICATOR}:${process.env.DATABASE_AUTHENTICATOR_PASSWORD}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}`;
process.env.SHADOW_DATABASE_URL = process.env.SHADOW_DATABASE_URL
  ? fixFilePaths(process.env.SHADOW_DATABASE_URL)
  : `postgres://${process.env.DATABASE_OWNER}:${process.env.DATABASE_OWNER_PASSWORD}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}_shadow`;
process.env.SHADOW_AUTH_DATABASE_URL = process.env.SHADOW_AUTH_DATABASE_URL
  ? fixFilePaths(process.env.SHADOW_AUTH_DATABASE_URL)
  : `postgres://${process.env.DATABASE_AUTHENTICATOR}:${process.env.DATABASE_AUTHENTICATOR_PASSWORD}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}_shadow`;

// Always overwrite test database URL
process.env.TEST_DATABASE_URL = `postgres://${process.env.DATABASE_OWNER}:${process.env.DATABASE_OWNER_PASSWORD}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}_test`;

// https://docs.cypress.io/guides/guides/environment-variables.html#Option-3-CYPRESS
process.env.CYPRESS_ROOT_URL = process.env.ROOT_URL;
