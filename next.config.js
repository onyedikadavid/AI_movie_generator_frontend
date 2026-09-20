/** @type {import('next').NextConfig} */

// Allow Next/Image to load generated keyframes from wherever the backend
// actually runs (default: localhost:8000), not just a hardcoded host.
let apiHost = { hostname: "localhost", port: "8000" };
try {
  const apiUrl = new URL(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000");
  apiHost = { hostname: apiUrl.hostname, port: apiUrl.port || "" };
} catch {
  // fall back to the default above
}

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "http", hostname: apiHost.hostname, port: apiHost.port, pathname: "/storage/**" },
      { protocol: "https", hostname: apiHost.hostname, port: apiHost.port, pathname: "/storage/**" },
    ],
  },
};

module.exports = nextConfig;
