import { defaultNumber, minLength, parseInteger, required } from "./validate";

// @ts-ignore
const packageJson = require("../../../package.json");

// TODO: customise this with your own settings!

export const fromEmail: string = `"PostGraphile Starter" <no-reply@examples.graphile.org>`;
export const awsRegion: string = "us-east-1";
export const projectName: string = packageJson.name.replace(/[-_]/g, " ");
export const companyName: string = projectName; // For copyright ownership
export const emailLegalText: string =
  // Envvar here so we can override on the demo website
  process.env.LEGAL_TEXT || "<Insert legal email footer text here >";

export const SECRET: string = minLength(
  required({ value: process.env.SECRET, name: "SECRET" }),
  64
).value;

export const JWT_SECRET: string = minLength(
  required({
    value: process.env.JWT_SECRET,
    name: "JWT_SECRET",
  }),
  64
).value;

export const REDIS_URL: string | undefined = process.env.REDIS_URL;

export const DATABASE_URL: string = required({
  value: process.env.DATABASE_URL,
  name: "DATABASE_URL",
}).value;

export const AUTH_DATABASE_URL: string = required({
  value: process.env.AUTH_DATABASE_URL,
  name: "AUTH_DATABASE_URL",
}).value;

export const NODE_ENV: string = required({
  value: process.env.NODE_ENV,
  name: "NODE_ENV",
}).value;

export const isDev: boolean = NODE_ENV === "development";

export const isTest: boolean = NODE_ENV === "test";

export const isDevOrTest: boolean = isDev || isTest;

export const ROOT_URL: string = required({
  value: process.env.ROOT_URL,
  name: "ROOT_URL",
}).value;

export const TRUST_PROXY: string | undefined = process.env.TRUST_PROXY;

export const ENABLE_GRAPHIQL: boolean = !!process.env.ENABLE_GRAPHIQL;

export const GRAPHILE_LICENSE: string | undefined =
  process.env.GRAPHILE_LICENSE;
// Pro plugin options (requires process.env.GRAPHILE_LICENSE)
export const GRAPHQL_PAGINATION_CAP: number = defaultNumber(
  parseInteger({
    value: process.env.GRAPHQL_PAGINATION_CAP,
    name: "GRAPHQL_PAGINATION_CAP",
  }),
  50
).value;
export const GRAPHQL_DEPTH_LIMIT: number = defaultNumber(
  parseInteger({
    value: process.env.GRAPHQL_DEPTH_LIMIT,
    name: "GRAPHQL_DEPTH_LIMIT",
  }),
  12
).value;
export const GRAPHQL_COST_LIMIT: number = defaultNumber(
  parseInteger({
    value: process.env.GRAPHQL_COST_LIMIT,
    name: "GRAPHQL_COST_LIMIT",
  }),
  30000
).value;
export const HIDE_QUERY_COST: boolean =
  defaultNumber(
    parseInteger({
      value: process.env.HIDE_QUERY_COST,
      name: "HIDE_QUERY_COST",
    }),
    0
  ).value < 1;

export const PORT: number = defaultNumber(
  parseInteger({ value: process.env.PORT, name: "PORT" }),
  3000
).value;

export const ENABLE_CYPRESS_COMMANDS: boolean =
  process.env.ENABLE_CYPRESS_COMMANDS === "1";

export const GITHUB_KEY: string | undefined = process.env.GITHUB_KEY;
export const GITHUB_SECRET: string | undefined = process.env.GITHUB_SECRET;

export const DATABASE_VISITOR: string | undefined =
  process.env.DATABASE_VISITOR;

const MILLISECOND = 1;
const SECOND = 1000 * MILLISECOND;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
export const MAXIMUM_SESSION_DURATION_IN_MILLISECONDS: number = defaultNumber(
  parseInteger({
    value: process.env.MAXIMUM_SESSION_DURATION_IN_MILLISECONDS,
    name: "MAXIMUM_SESSION_DURATION_IN_MILLISECONDS",
  }),
  3 * DAY
).value;

export const T_AND_C_URL: string | undefined = process.env.T_AND_C_URL;
