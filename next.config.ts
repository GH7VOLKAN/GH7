import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ["iyzipay"],
  turbopack: {
    root: ".",
  },
};

export default nextConfig;
