import type { NextConfig } from "next"

// GitHub Pages project sites are served from /<repo>. User sites
// (<user>.github.io) and local dev leave this empty.
const basePath = (process.env.BASE_PATH ?? "").replace(/\/$/, "")

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  allowedDevOrigins: ["127.0.0.1"],
  ...(basePath ? { basePath, assetPrefix: basePath } : {}),
}

export default nextConfig
