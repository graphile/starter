const { spawnSync } = require("child_process");

const runSync = (cmd, args, options = {}) => {
  const result = spawnSync(cmd, args, {
    stdio: ["inherit", "inherit", "inherit"],
    windowsHide: true,
    ...options,
    env: {
      ...process.env,
      YARN_SILENT: "1",
      npm_config_loglevel: "silent",
      ...options.env,
    },
  });

  const { error, status, signal, stderr, stdout } = result;

  if (error) {
    throw error;
  }

  if (status || signal) {
    if (stdout) {
      console.log(stdout.toString("utf8"));
    }
    if (stderr) {
      console.error(stderr.toString("utf8"));
    }
    if (status) {
      process.exitCode = status;
      throw new Error(
        `Process exited with status '${status}' (running '${cmd} ${
          args ? args.join(" ") : ""
        }')`
      );
    } else {
      throw new Error(
        `Process exited due to signal '${signal}' (running '${cmd} ${
          args ? args.join(" ") : null
        }')`
      );
    }
  }

  return result;
};

exports.runSync = runSync;
