import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  // The Go backend is served under the site's own origin so the httpOnly session cookie is first-party.
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${API_URL}/api/:path*` },
      { source: "/admin", destination: `${API_URL}/admin` },
      { source: "/admin/:path*", destination: `${API_URL}/admin/:path*` },
    ];
  },
};

export default nextConfig;
