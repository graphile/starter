import type { ThemeConfig } from "antd";

// Customize your theme via the theme editor: https://ant.design/theme-editor
const theme: ThemeConfig = {
  token: {
    colorBgBase: "#ffffff",
    colorTextBase: "#0a0a0a",
    colorPrimary: "#3055ee",
    colorBgLayout: "#fff",
  },
  components: {
    Layout: {
      headerBg: "#fff",
    },
  },
};

export default theme;
