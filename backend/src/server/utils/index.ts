/*! This file contains code that is copyright 2019 Graphile Ltd, see
 * GRAPHILE_LICENSE.md for license information. */
export function sanitiseEnv() {
  const requiredEnvvars = ["AUTH_DATABASE_URL", "DATABASE_URL", "SECRET"];
  requiredEnvvars.forEach(envvar => {
    if (!process.env[envvar]) {
      throw new Error(
        `Could not find process.env.${envvar} - did you remember to run the setup script? Have you sourced the environmental variables file '.env'?`
      );
    }
  });

  process.env.NODE_ENV = process.env.NODE_ENV || "development";
}
