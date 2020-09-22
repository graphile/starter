const { spawn } = require("child_process");
spawn("yarn", ["workspace", "@app/worker", "install-db-schema"], {
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: process.env.GM_DBURL,
  },
  shell: true,
});
