const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    testIsolation: false,
    setupNodeEvents(on, config) {
      if (process.env.CI) {
        // CI seems to be pretty slow, lets be more forgiving
        config.defaultCommandTimeout = 20000; // default 4000
        config.requestTimeout = 10000; // default 5000
      }
    },
  },
});
