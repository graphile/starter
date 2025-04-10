import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    ROOT_DATABASE_URL: process.env.ROOT_DATABASE_URL,
    ROOT_URL: process.env.ROOT_URL,
    T_AND_C_URL: process.env.T_AND_C_URL,
  },
};

export default nextConfig;
