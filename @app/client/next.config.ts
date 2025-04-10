import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    ROOT_URL: "http://localhost:5678",
    T_AND_C_URL: undefined,
  },
};

export default nextConfig;
