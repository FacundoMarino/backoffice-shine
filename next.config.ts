import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
] as const;

const nextConfig: NextConfig = {
  env: {
    SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME ?? "cc_admin_session",
  },
  async headers() {
    return [{ source: "/(.*)", headers: [...securityHeaders] }];
  },
  typedRoutes: true,
};

export default nextConfig;
