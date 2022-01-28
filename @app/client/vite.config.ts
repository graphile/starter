import react from "@vitejs/plugin-react";
import { UserConfig } from "vite";
import ssr from "vite-plugin-ssr/plugin";
import Icons from "unplugin-icons/vite";

const config: UserConfig = {
  plugins: [react(), Icons({}), ssr()],
  root: "./src",
  define: {
    __ROOT_URL__: JSON.stringify(process.env.ROOT_URL),
  },
};

export default config;
