export function sanitizeEnv() {
  const requiredEnvvars = [
    "AUTH_DATABASE_URL",
    "DATABASE_URL",
    "SECRET",
    "NODE_ENV",
  ];
  requiredEnvvars.forEach((envvar) => {
    if (!process.env[envvar]) {
      throw new Error(
        `Could not find process.env.${envvar} - did you remember to run the setup script? Have you sourced the environmental variables file '.env'?`
      );
    }
  });
}
