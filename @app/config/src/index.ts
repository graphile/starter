require("dotenv").config({ path: `${__dirname}/../../.env` });
// @ts-ignore
const packageJson = require("../../package.json");

// TODO: customise this with your own settings!

export const fromEmail =
  '"PostGraphile Starter" <no-reply@examples.graphile.org>';
export const awsRegion = "us-east-1";
export const projectName = packageJson.name;
export const companyName = projectName; // For copyright ownership
export const emailLegalText =
  // Envvar here so we can override on the demo website
  process.env.LEGAL_TEXT || "<Insert legal email footer text here >";

// These are the connection strings for the DB and the test DB.
// NOTE: in production you probably want to add ?ssl=1 to force SSL usage.
// NOTE: 'psql' does not like ?ssl=1, use ?sslmode=require for psql.
// NOTE: these used to be in `.env` but now it is used by docker-compose we can't use expansions
export const DATABASE_URL = `postgres://${process.env.DATABASE_OWNER}:${process.env.DATABASE_OWNER_PASSWORD}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}`;
export const AUTH_DATABASE_URL = `postgres://${process.env.DATABASE_AUTHENTICATOR}:${process.env.DATABASE_AUTHENTICATOR_PASSWORD}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}`;
export const SHADOW_DATABASE_URL = `postgres://${process.env.DATABASE_OWNER}:${process.env.DATABASE_OWNER_PASSWORD}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}_shadow`;
export const SHADOW_AUTH_DATABASE_URL = `postgres://${process.env.DATABASE_AUTHENTICATOR}:${process.env.DATABASE_AUTHENTICATOR_PASSWORD}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}_shadow`;
export const TEST_DATABASE_URL = `postgres://${process.env.DATABASE_OWNER}:${process.env.DATABASE_OWNER_PASSWORD}@${process.env.DATABASE_HOST}/${process.env.DATABASE_NAME}_test`;
