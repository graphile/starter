const wp = require("@cypress/webpack-preprocessor");

module.exports = (on, config) => {
  const options = {
    webpackOptions: {
      resolve: {
        extensions: [".ts", ".js"],
      },
      module: {
        rules: [
          {
            test: /\.ts$/,
            exclude: [/node_modules/],
            use: [
              {
                loader: "ts-loader",
                options: { transpileOnly: true },
              },
            ],
          },
        ],
      },
    },
  };
  on("file:preprocessor", wp(options));

  if (process.env.CI) {
    // CI seems to be pretty slow, lets be more forgiving
    config.defaultCommandTimeout = 20000; // default 4000
    config.requestTimeout = 10000; // default 5000
  }
  return config;
};
