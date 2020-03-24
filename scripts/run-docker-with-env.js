#!/usr/bin/env node
require("dotenv").config();
const { runSync } = require("./lib/run");

const {
  DATABASE_OWNER,
  DATABASE_OWNER_PASSWORD,
  DATABASE_AUTHENTICATOR,
  DATABASE_AUTHENTICATOR_PASSWORD,
  DATABASE_VISITOR,
  SECRET,
  JWT_SECRET,
  GITHUB_KEY,
  GITHUB_SECRET,
  DATABASE_NAME,
  GRAPHILE_LICENSE,
} = process.env;

const DATABASE_HOST = "172.17.0.1";
const DATABASE_URL = `postgres://${DATABASE_OWNER}:${DATABASE_OWNER_PASSWORD}@${DATABASE_HOST}/${DATABASE_NAME}`;
const AUTH_DATABASE_URL = `postgres://${DATABASE_AUTHENTICATOR}:${DATABASE_AUTHENTICATOR_PASSWORD}@${DATABASE_HOST}/${DATABASE_NAME}`;

runSync("docker", [
  "run",
  "--rm",
  "-it",
  "--init",
  "-p",
  "5678:5678",
  "-e",
  `DATABASE_VISITOR=${DATABASE_VISITOR}`,
  "-e",
  `GRAPHILE_LICENSE=${GRAPHILE_LICENSE}`,
  "-e",
  `SECRET=${SECRET}`,
  "-e",
  `JWT_SECRET=${JWT_SECRET}`,
  "-e",
  `DATABASE_URL=${DATABASE_URL}`,
  "-e",
  `AUTH_DATABASE_URL=${AUTH_DATABASE_URL}`,
  "-e",
  `GITHUB_KEY=${GITHUB_KEY}`,
  "-e",
  `GITHUB_SECRET=${GITHUB_SECRET}`,
  process.argv[2],
]);
