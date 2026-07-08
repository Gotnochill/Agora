/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep the Prisma runtime and driver adapters out of the server bundle so
  // their native/optional deps resolve correctly on the serverless layer.
  experimental: {
    serverComponentsExternalPackages: [
      "@prisma/client",
      "@prisma/adapter-neon",
      "@prisma/adapter-pg",
      "@neondatabase/serverless",
      "ws",
    ],
  },
};

export default nextConfig;
