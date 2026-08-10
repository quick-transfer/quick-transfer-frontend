import type { NextConfig } from "next";
import path from "node:path";

const projectRoot = path.resolve(process.cwd());

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    // `__dirname` was evaluated as an empty string by Turbopack on Windows.
    root: projectRoot,
  },
};

export default nextConfig;
