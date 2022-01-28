import react from "@vitejs/plugin-react";
import { UserConfig } from "vite";
import ssr from "vite-plugin-ssr/plugin";

const config: UserConfig = {
  plugins: [react(), ssr()],
  root: "./src",
};

export default config;
