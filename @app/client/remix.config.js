/**
 * @type {import('@remix-run/dev').AppConfig}
 */
module.exports = {
  devServerBroadcastDelay: 3000,
  devServerPort: 8002,
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: [".*", "**/*.css", "**/*.test.{js,jsx,ts,tsx}"],
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
  // publicPath: "/build/",
};
