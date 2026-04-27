const path = require("path");

module.exports = {
  reactStrictMode: true,
  transpilePackages: ["@repo/ui", "@repo/tailwind-config"],
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  async redirects() {
    return [
      { source: "/live-prices", destination: "/market/trends", permanent: true },
      { source: "/price-trends", destination: "/market/trends", permanent: true },
      { source: "/signup", destination: "/register", permanent: true },
      { source: "/admin/prices", destination: "/admin/admin-panel/price-moderation", permanent: false },
      { source: "/admin/vendors/verification", destination: "/admin/admin-panel/vendor-verification", permanent: false },
      { source: "/admin/categories", destination: "/admin/admin-panel/categories", permanent: false },
      { source: "/admin/logs", destination: "/admin/admin-panel/audit-logs", permanent: false },
      { source: "/admin/ml", destination: "/admin/admin-panel/ml-monitoring", permanent: false },
      { source: "/admin/dashboard", destination: "/admin/admin-panel/dashboard", permanent: false },
      { source: "/admin/users", destination: "/admin/admin-panel/users", permanent: false },
      { source: "/admin/vendors", destination: "/admin/admin-panel/vendors", permanent: false },
      { source: "/admin/settings", destination: "/admin/admin-panel/system-settings", permanent: false },
      { source: "/admin/moderate/prices", destination: "/admin/admin-panel/price-moderation", permanent: false },
    ];
  },
  async rewrites() {
    return [
      { source: "/market/:id(\\d+)", destination: "/market/items/:id" },
    ];
  },
};
