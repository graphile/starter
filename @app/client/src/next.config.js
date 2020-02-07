require("@app/config");
const compose = require("lodash/flowRight");

const {
  ROOT_URL,
  T_AND_C_URL,
  BUCKET,
  AWSACCESSKEYID,
  AWSSECRETKEY,
  AWS_REGION,
} = process.env;
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
      serverRuntimeConfig: {
        BUCKET: BUCKET,
        AWSACCESSKEYID: AWSACCESSKEYID,
        AWSSECRETKEY: AWSSECRETKEY,
        AWS_REGION: AWS_REGION,
      },
      poweredByHeader: false,
      distDir: `../.next`,
      exportTrailingSlash: true,
      lessLoaderOptions: {
        javascriptEnabled: true,
        modifyVars: themeVariables, // make your antd custom effective
      },
      webpack(config, { webpack, dev, isServer }) {
        if (dev) config.devtool = "cheap-module-source-map";

        return {
          ...config,
          plugins: [
            ...config.plugins,
            new webpack.DefinePlugin({
              "process.env.ROOT_URL": JSON.stringify(ROOT_URL),
              "process.env.T_AND_C_URL": JSON.stringify(T_AND_C_URL || null),
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
