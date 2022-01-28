require("@app/config");
const compose = require("lodash/flowRight");
// TODO: enable AntDDayjsWebpackPlugin after this PR is merged: https://github.com/ant-design/antd-dayjs-webpack-plugin/pull/64
// const AntDDayjsWebpackPlugin = require("antd-dayjs-webpack-plugin");

if (!process.env.ROOT_URL) {
  if (process.argv[1].endsWith("/depcheck")) {
    /* NOOP */
  } else {
    throw new Error("ROOT_URL is a required envvar");
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
(function (process = null) {
  // You *must not* use `process.env` in here, because we need to check we have
  // those variables. To enforce this, we've deliberately shadowed process.
  module.exports = () => {
    const withLess = require("next-with-less");
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

    return compose(withLess)({
      poweredByHeader: false,
      distDir: `../.next`,
      trailingSlash: false,
      lessLoaderOptions: {
        lessOptions: {
          javascriptEnabled: true,
          modifyVars: themeVariables, // make your antd custom effective
        },
      },
      webpack(config, { webpack, isServer }) {
        return {
          ...config,
          plugins: [
            ...config.plugins,
            new webpack.DefinePlugin({
              /*
               * IMPORTANT: we don't want to hard-code these values, otherwise
               * we cannot promote a bundle to another environment. Further,
               * they need to be valid both within the browser _AND_ on the
               * server side when performing SSR.
               */
              "process.env.ROOT_URL":
                "(typeof window !== 'undefined' ? window.__GRAPHILE_APP__.ROOT_URL : process.env.ROOT_URL)",
              "process.env.T_AND_C_URL":
                "(typeof window !== 'undefined' ? window.__GRAPHILE_APP__.T_AND_C_URL : process.env.T_AND_C_URL)",
            }),
            new webpack.IgnorePlugin({
              // These modules are server-side only; we don't want webpack
              // attempting to bundle them into the client.
              resourceRegExp: /^(node-gyp-build|bufferutil|utf-8-validate)$/,
            }),
            // new AntDDayjsWebpackPlugin(),
          ],
          externals: [
            ...(config.externals || []),
            isServer ? { "pg-native": "pg/lib/client" } : null,
          ].filter((_) => _),
        };
      },
    });
  };
})();
