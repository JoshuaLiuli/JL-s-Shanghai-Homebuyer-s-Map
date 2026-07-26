import type { NextConfig } from "next";

const repositoryName = "JL-s-Shanghai-Homebuyer-s-Map";
const isGitHubPages = process.env.GITHUB_ACTIONS === "true";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: isGitHubPages ? `/${repositoryName}` : "",
  assetPrefix: isGitHubPages ? `/${repositoryName}/` : "",
};

export default nextConfig;
