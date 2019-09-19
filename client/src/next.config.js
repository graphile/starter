const compose = require("lodash/flowRight");

const { ROOT_DOMAIN, ROOT_URL } = process.env;
if (!ROOT_DOMAIN) {
  throw new Error("ROOT_DOMAIN is a required envvar");
}
if (!ROOT_URL) {
  throw new Error("ROOT_URL is a required envvar");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
(function(process = null) {
  // You *must not* use `process.env` in here, because we need to check we have
  // those variables. To enforce this, we've deliberately shadowed process.
  module.exports = () => {
    const withCss = require("@zeit/next-css");
    const withLess = require("@zeit/next-less");
    const lessToJS = require("less-vars-to-js");
    const fs = require("fs");
    const path = require("path");
    // Where your antd-custom.less file lives
    const themeVariables = lessToJS(
      fs.readFileSync(
        path.resolve(__dirname, "../assets/antd-custom.less"),
        "utf8"
      )
    );
    // fix: prevents error when .less files are required by node
    if (typeof require !== "undefined") {
      require.extensions[".less"] = () => {};
    }
    return compose(
      withCss,
      withLess
    )({
      distDir: "../../.next",
      exportTrailingSlash: true,
      lessLoaderOptions: {
        javascriptEnabled: true,
        modifyVars: themeVariables, // make your antd custom effective
      },
      webpack(config, { webpack, dev, dir, isServer }) {
        if (dev) config.devtool = "cheap-module-source-map";

        const graphqlRule = {
          test: /\.(graphql|gql)$/,
          include: [dir],
          exclude: /node_modules/,
          use: [
            {
              loader: "graphql-tag/loader",
            },
          ],
        };
        return {
          ...config,
          module: {
            ...config.module,
            rules: [...config.module.rules, graphqlRule],
          },
          plugins: [
            ...config.plugins,
            new webpack.DefinePlugin({
              "process.env.ROOT_DOMAIN": JSON.stringify(ROOT_DOMAIN),
              "process.env.ROOT_URL": JSON.stringify(ROOT_URL),
            }),
          ],
          externals: [
            ...(config.externals || []),
            isServer ? { "pg-native": "pg/lib/client" } : null,
          ].filter(_ => _),
        };
      },
    });
  };
})();
