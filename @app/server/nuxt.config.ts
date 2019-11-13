import path from "path";
export default {
  modulesDir: [
    path.resolve(__dirname, "../../node_modules/"),
    path.resolve(__dirname, "../../@app/"), // TODO: (more testing) let's nuxt see @app after hot-reload
  ],
  server: {
    //TODO: read $PORT
    port: 5678, // default: 3000
    host: "0.0.0.0", // default: localhost
  },
  srcDir: "src/nuxt",
  env: {},
  head: {
    title: "graphile-starter",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: "graphile starter using nuxt.js w/ TS",
      },
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  },
  loading: { color: "#3B8070" },
  css: [
    "src/nuxt/assets/css/main.css",
    {
      src: "ant-design-vue/dist/antd.less",
      lang: "less",
    },
  ],
  build: {
    extend(_config: any, ctx: any) {
      if (ctx.isDev && ctx.isClient) {
      }
    },
    loaders: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          "layout-header-background": "#fff",
          "primary-color": "rgba(222, 12, 101, 1.0)",
          "component-background": "#ffffff",
        },
      },
    },
  },
  buildModules: ["@nuxt/typescript-build"],
  modules: ["@nuxtjs/axios"],
  axios: {},
};
