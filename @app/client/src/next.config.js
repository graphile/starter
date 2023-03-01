require("@app/config");

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
    return {
      poweredByHeader: false,
      distDir: `../.next`,
      trailingSlash: false,
      webpack(config, { webpack, dev, isServer }) {
        const makeSafe = (externals) => {
          if (Array.isArray(externals)) {
            return externals.map((ext) => {
              if (typeof ext === "function") {
                return (obj, callback) => {
                  if (/^@app\//.test(obj.request)) {
                    callback();
                  } else {
                    return ext(obj, callback);
                  }
                };
              } else {
                return ext;
              }
            });
          }
        };

        const externals =
          isServer && dev ? makeSafe(config.externals) : config.externals;

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
            ...(isServer
              ? []
              : [
                  // Don't try and bundle Grafast on the client for heaven's sake
                  new webpack.NormalModuleReplacementPlugin(
                    /GraphileApolloLink.js/,
                    "./GraphileApolloLink.client.js"
                  ),
                ]),
          ],
          externals: [
            ...(externals || []),
            isServer ? { "pg-native": "pg/lib/client" } : null,
            { "node:buffer": "buffer" },
            { "node:crypto": "crypto" },
            { "node:http": "http" },
          ].filter((_) => _),
        };
      },
    };
  };
})();
