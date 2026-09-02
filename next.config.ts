import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/proposta/:token",
        destination: "/proposta?token=:token",
        permanent: false,
      },
      {
        source: "/admin/propostas/:id",
        destination: "/admin/propostas?proposalId=:id",
        permanent: false,
      },
    ];
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    ];
    const privateHeaders = [
      ...securityHeaders,
      { key: "Cache-Control", value: "private, no-store, max-age=0" },
      { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" },
    ];
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/admin/:path*", headers: privateHeaders },
      { source: "/briefing/:path*", headers: privateHeaders },
      { source: "/proposta/:path*", headers: privateHeaders },
      { source: "/review/:path*", headers: privateHeaders },
    ];
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      const currentExternals = Array.isArray(config.externals)
        ? config.externals
        : config.externals
          ? [config.externals]
          : [];

      config.externals = [...currentExternals, "cloudflare:sockets"];
    }

    return config;
  },
};

export default nextConfig;

if (process.env.NODE_ENV === "development") {
  import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
}
